// Scratch voice-over with exact word timings, fully local (Apple's on-device speech).
//   swift audio/vo/tts.swift <lines.json> <out.wav> <out.json> [voiceId] [rate]
// lines.json: [{"id": "hook", "text": "...", "gap": 0.15}]  (gap = silence after the line, seconds)
// out.json:   {"sr":..., "duration":..., "lines":[{"id","t0","t1","words":[{"w","t0","t1"}]}]}
// Replace with a real recording later: keep the same lines and re-time with your own alignment.
import AVFoundation
import Foundation

struct Line: Codable { let id: String; let text: String; let gap: Double? ; let rate: Double? }
let args = CommandLine.arguments
let lines = try! JSONDecoder().decode([Line].self, from: Data(contentsOf: URL(fileURLWithPath: args[1])))
let outWav = URL(fileURLWithPath: args[2])
let outJson = URL(fileURLWithPath: args[3])
let voiceId = args.count > 4 ? args[4] : "com.apple.ttsbundle.siri_aaron_en-US_compact"
let baseRate = args.count > 5 ? Float(args[5])! : 0.52

let synth = AVSpeechSynthesizer()
var samples: [Float] = []
var sr: Double = 22050
var outLines: [[String: Any]] = []

/// synthesize text -> mono float samples (raw, untrimmed)
func speak(_ text: String, rate: Float) -> [Float] {
  let u = AVSpeechUtterance(string: text)
  u.voice = AVSpeechSynthesisVoice(identifier: voiceId) ?? AVSpeechSynthesisVoice(language: "en-US")
  u.rate = rate
  u.pitchMultiplier = 0.96
  u.preUtteranceDelay = 0; u.postUtteranceDelay = 0
  var buf: [Float] = []
  let done = DispatchSemaphore(value: 0)
  var finished = false
  synth.write(u) { b in
    guard let pcm = b as? AVAudioPCMBuffer else { return }
    if pcm.frameLength == 0 { if !finished { finished = true; done.signal() }; return }
    sr = pcm.format.sampleRate
    if let f = pcm.floatChannelData { buf.append(contentsOf: UnsafeBufferPointer(start: f[0], count: Int(pcm.frameLength))) }
    else if let i = pcm.int16ChannelData { for k in 0..<Int(pcm.frameLength) { buf.append(Float(i[0][k]) / 32768) } }
  }
  while done.wait(timeout: .now() + 0.005) == .timedOut { RunLoop.current.run(until: Date().addingTimeInterval(0.005)) }
  return buf
}
let thr: Float = 0.004
func firstSound(_ b: [Float], from: Int = 0) -> Int { var i = from; while i < b.count && abs(b[i]) <= thr { i += 1 }; return i }
func lastSound(_ b: [Float]) -> Int { (b.lastIndex { abs($0) > thr } ?? b.count - 1) + 1 }
/// first sound onset at/after `from` that follows >= minGap samples of silence (finds the start of the next word after a pause)
func onsetAfterGap(_ b: [Float], from: Int, minGap: Int) -> Int? {
  var quiet = 0
  var i = from
  // envelope over 5 ms windows
  let w = max(1, Int(0.005 * sr))
  while i + w < b.count {
    var m: Float = 0
    for k in i..<(i + w) { m = max(m, abs(b[k])) }
    if m <= thr * 2 { quiet += w } else { if quiet >= minGap { return i }; quiet = 0 }
    i += w
  }
  return nil
}

for line in lines {
  let rate = line.rate.map { Float($0) } ?? baseRate
  let full = speak(line.text, rate: rate)
  let a = max(0, firstSound(full) - Int(0.01 * sr))
  let z = min(full.count, lastSound(full) + Int(0.01 * sr))
  let clip = Array(full[a..<z])
  let t0 = Double(samples.count) / sr
  samples.append(contentsOf: clip)
  let t1 = Double(samples.count) / sr
  // word onsets: speak each prefix ("w1 .. wk"); the next word starts where the prefix's sound ends.
  // After punctuation the voice pauses, so snap to the first onset after a >=70 ms silence.
  let toks = line.text.split(separator: " ").map(String.init)
  var onsets: [Int] = [0]
  for k in 1..<max(1, toks.count) {
    let pre = speak(toks[0..<k].joined(separator: " "), rate: rate)
    var on = lastSound(pre) - firstSound(pre)
    if let lastCh = toks[k - 1].last, ",.;:!?".contains(lastCh),
       let snap = onsetAfterGap(clip, from: max(0, on - Int(0.08 * sr)), minGap: Int(0.07 * sr)) {
      on = snap
    }
    on = max(on, onsets.last! + Int(0.06 * sr))
    onsets.append(min(on, clip.count - 1))
  }
  var words: [[String: Any]] = []
  for (k, w) in toks.enumerated() {
    let s = t0 + Double(onsets[k]) / sr
    let e = k + 1 < toks.count ? t0 + Double(onsets[k + 1]) / sr : t1
    words.append(["w": w, "t0": s, "t1": e])
  }
  outLines.append(["id": line.id, "text": line.text, "t0": t0, "t1": t1, "words": words])
  samples.append(contentsOf: [Float](repeating: 0, count: Int((line.gap ?? 0.12) * sr)))
  FileHandle.standardError.write("\(line.id) \(String(format: "%.2f", t1 - t0)) s\n".data(using: .utf8)!)
}

// write 16-bit mono WAV
var d = Data()
func u32(_ v: UInt32) { var x = v.littleEndian; d.append(Data(bytes: &x, count: 4)) }
func u16(_ v: UInt16) { var x = v.littleEndian; d.append(Data(bytes: &x, count: 2)) }
let n = samples.count
d.append("RIFF".data(using: .ascii)!); u32(UInt32(36 + n * 2)); d.append("WAVEfmt ".data(using: .ascii)!)
u32(16); u16(1); u16(1); u32(UInt32(sr)); u32(UInt32(sr) * 2); u16(2); u16(16)
d.append("data".data(using: .ascii)!); u32(UInt32(n * 2))
for s in samples { u16(UInt16(bitPattern: Int16(max(-1, min(1, s)) * 32767))) }
try! d.write(to: outWav)
let js: [String: Any] = ["sr": sr, "duration": Double(n) / sr, "voice": voiceId, "lines": outLines]
try! JSONSerialization.data(withJSONObject: js, options: [.prettyPrinted, .sortedKeys]).write(to: outJson)
print(String(format: "%.2f s, %d lines", Double(n) / sr, outLines.count))
