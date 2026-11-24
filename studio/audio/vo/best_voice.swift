// Prints the identifier of the best installed English voice: Premium > Enhanced > Siri compact.
// Preference within a tier: PREFER names (narrator-style male voices first), then en-US.
import AVFoundation
let prefer = CommandLine.arguments.dropFirst().map { $0.lowercased() }
let vs = AVSpeechSynthesisVoice.speechVoices().filter { $0.language.hasPrefix("en") && !$0.identifier.contains("speech.synthesis") }
func rank(_ v: AVSpeechSynthesisVoice) -> (Int, Int, Int) {
  let q = v.quality.rawValue  // 1 default, 2 enhanced, 3 premium
  let p = prefer.firstIndex(of: v.name.lowercased()).map { 100 - $0 } ?? (v.identifier.contains("siri") ? 1 : 0)
  return (q, p, v.language == "en-US" ? 1 : 0)
}
if let best = vs.max(by: { rank($0) < rank($1) }) {
  FileHandle.standardError.write("\(best.name) (\(best.language), quality \(best.quality.rawValue))\n".data(using: .utf8)!)
  print(best.identifier)
}
