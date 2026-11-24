import React from 'react';
import {Audio, Composition, Series, staticFile} from 'remotion';
import {FPS, H, W} from './theme';
import {LookTest, LOOKTEST_FRAMES} from './looks/LookTest';
import {CharTest} from './looks/CharTest';
import {Checks96Test, TEST_FRAMES} from './shorts/checks96/Test';
import {Checks96, CHECKS96_FRAMES} from './shorts/checks96/Short';
import {FilmShot, filmScript} from './kit/film';
import {PLAN as NOBODY_PLAN} from './films/nobody-is-watching/plan';
import {Shot01, SHOT01_FRAMES} from './shots/Shot01';
import {Shot02, SHOT02_FRAMES} from './shots/Shot02';
import {Shot03, SHOT03_FRAMES} from './shots/Shot03';
import {Shot04, SHOT04_FRAMES} from './shots/Shot04';
import {Shot05, SHOT05_FRAMES} from './shots/Shot05';
import {Shot06, SHOT06_FRAMES} from './shots/Shot06';
import {Shot07, SHOT07_FRAMES} from './shots/Shot07';
import {Shot08, SHOT08_FRAMES} from './shots/Shot08';
import {Shot09, SHOT09_FRAMES} from './shots/Shot09';
import {Shot10, SHOT10_FRAMES} from './shots/Shot10';
import {Shot11, SHOT11_FRAMES} from './shots/Shot11';
import {Shot12, SHOT12_FRAMES} from './shots/Shot12';
import {Shot13, SHOT13_FRAMES} from './shots/Shot13';
import {Shot14, SHOT14_FRAMES} from './shots/Shot14';
import {Shot15, SHOT15_FRAMES} from './shots/Shot15';
import {Shot16, SHOT16_FRAMES} from './shots/Shot16';
import {Shot17, SHOT17_FRAMES} from './shots/Shot17';
import {Shot18, SHOT18_FRAMES} from './shots/Shot18';
import {Shot19, SHOT19_FRAMES} from './shots/Shot19';
import {Shot20, SHOT20_FRAMES} from './shots/Shot20';
import {Shot21, SHOT21_FRAMES} from './shots/Shot21';
import {Shot22, SHOT22_FRAMES} from './shots/Shot22';
import {Shot23, SHOT23_FRAMES} from './shots/Shot23';
import {Shot24, SHOT24_FRAMES} from './shots/Shot24';
import {Shot25, SHOT25_FRAMES} from './shots/Shot25';
import {Shot26, SHOT26_FRAMES} from './shots/Shot26';
import {Shot27, SHOT27_FRAMES} from './shots/Shot27';
import {Shot28, SHOT28_FRAMES} from './shots/Shot28';
import {Shot29, SHOT29_FRAMES} from './shots/Shot29';
import {Shot30, SHOT30_FRAMES} from './shots/Shot30';
import {Shot31, SHOT31_FRAMES} from './shots/Shot31';
import {Shot32, SHOT32_FRAMES} from './shots/Shot32';
import {Shot33, SHOT33_FRAMES} from './shots/Shot33';
import {Shot34, SHOT34_FRAMES} from './shots/Shot34';
import {Shot35, SHOT35_FRAMES} from './shots/Shot35';
import {Shot36, SHOT36_FRAMES} from './shots/Shot36';
import {Shot37, SHOT37_FRAMES} from './shots/Shot37';
import {Shot38, SHOT38_FRAMES} from './shots/Shot38';
import {Shot39, SHOT39_FRAMES} from './shots/Shot39';
import {Shot40, SHOT40_FRAMES} from './shots/Shot40';
import {Shot41, SHOT41_FRAMES} from './shots/Shot41';
import {Shot42, SHOT42_FRAMES} from './shots/Shot42';
import {Shot43, SHOT43_FRAMES} from './shots/Shot43';
import {Shot44, SHOT44_FRAMES} from './shots/Shot44';
import {Shot45, SHOT45_FRAMES} from './shots/Shot45';
import {Shot46, SHOT46_FRAMES} from './shots/Shot46';
import {Shot47, SHOT47_FRAMES} from './shots/Shot47';
import {Shot48, SHOT48_FRAMES} from './shots/Shot48';
import {Shot49, SHOT49_FRAMES} from './shots/Shot49';
import {Shot50, SHOT50_FRAMES} from './shots/Shot50';
import {Shot51, SHOT51_FRAMES} from './shots/Shot51';
import {Shot52, SHOT52_FRAMES} from './shots/Shot52';
import {Shot53, SHOT53_FRAMES, Shot54, SHOT54_FRAMES, Shot55, SHOT55_FRAMES, Shot56, SHOT56_FRAMES, Shot57, SHOT57_FRAMES} from './shots/Closing';

/** script order; every boundary is a hard cut */
export const ACT1: {id: string; C: React.FC; frames: number}[] = [
  {id: 'Shot01', C: Shot01, frames: SHOT01_FRAMES},
  {id: 'Shot02', C: Shot02, frames: SHOT02_FRAMES},
  {id: 'Shot03', C: Shot03, frames: SHOT03_FRAMES},
  {id: 'Shot04', C: Shot04, frames: SHOT04_FRAMES},
  {id: 'Shot05', C: Shot05, frames: SHOT05_FRAMES},
  {id: 'Shot06', C: Shot06, frames: SHOT06_FRAMES},
  {id: 'Shot07', C: Shot07, frames: SHOT07_FRAMES},
  {id: 'Shot08', C: Shot08, frames: SHOT08_FRAMES},
  {id: 'Shot09', C: Shot09, frames: SHOT09_FRAMES},
  {id: 'Shot10', C: Shot10, frames: SHOT10_FRAMES},
];

export const ACT2: typeof ACT1 = [
  {id: 'Shot11', C: Shot11, frames: SHOT11_FRAMES},
  {id: 'Shot12', C: Shot12, frames: SHOT12_FRAMES},
  {id: 'Shot13', C: Shot13, frames: SHOT13_FRAMES},
  {id: 'Shot14', C: Shot14, frames: SHOT14_FRAMES},
  {id: 'Shot15', C: Shot15, frames: SHOT15_FRAMES},
  {id: 'Shot16', C: Shot16, frames: SHOT16_FRAMES},
  {id: 'Shot17', C: Shot17, frames: SHOT17_FRAMES},
  {id: 'Shot18', C: Shot18, frames: SHOT18_FRAMES},
  {id: 'Shot19', C: Shot19, frames: SHOT19_FRAMES},
  {id: 'Shot20', C: Shot20, frames: SHOT20_FRAMES},
  {id: 'Shot21', C: Shot21, frames: SHOT21_FRAMES},
  {id: 'Shot22', C: Shot22, frames: SHOT22_FRAMES},
  {id: 'Shot23', C: Shot23, frames: SHOT23_FRAMES},
  {id: 'Shot24', C: Shot24, frames: SHOT24_FRAMES},
  {id: 'Shot25', C: Shot25, frames: SHOT25_FRAMES},
  {id: 'Shot26', C: Shot26, frames: SHOT26_FRAMES},
  {id: 'Shot27', C: Shot27, frames: SHOT27_FRAMES},
  {id: 'Shot28', C: Shot28, frames: SHOT28_FRAMES},
  {id: 'Shot29', C: Shot29, frames: SHOT29_FRAMES},
  {id: 'Shot30', C: Shot30, frames: SHOT30_FRAMES},
];

export const ACT3: typeof ACT1 = [
  {id: 'Shot31', C: Shot31, frames: SHOT31_FRAMES},
  {id: 'Shot32', C: Shot32, frames: SHOT32_FRAMES},
  {id: 'Shot33', C: Shot33, frames: SHOT33_FRAMES},
  {id: 'Shot34', C: Shot34, frames: SHOT34_FRAMES},
  {id: 'Shot35', C: Shot35, frames: SHOT35_FRAMES},
  {id: 'Shot36', C: Shot36, frames: SHOT36_FRAMES},
  {id: 'Shot37', C: Shot37, frames: SHOT37_FRAMES},
  {id: 'Shot38', C: Shot38, frames: SHOT38_FRAMES},
  {id: 'Shot39', C: Shot39, frames: SHOT39_FRAMES},
  {id: 'Shot40', C: Shot40, frames: SHOT40_FRAMES},
  {id: 'Shot41', C: Shot41, frames: SHOT41_FRAMES},
  {id: 'Shot42', C: Shot42, frames: SHOT42_FRAMES},
  {id: 'Shot43', C: Shot43, frames: SHOT43_FRAMES},
  {id: 'Shot44', C: Shot44, frames: SHOT44_FRAMES},
  {id: 'Shot45', C: Shot45, frames: SHOT45_FRAMES},
  {id: 'Shot46', C: Shot46, frames: SHOT46_FRAMES},
  {id: 'Shot47', C: Shot47, frames: SHOT47_FRAMES},
  {id: 'Shot48', C: Shot48, frames: SHOT48_FRAMES},
  {id: 'Shot49', C: Shot49, frames: SHOT49_FRAMES},
  {id: 'Shot50', C: Shot50, frames: SHOT50_FRAMES},
  {id: 'Shot51', C: Shot51, frames: SHOT51_FRAMES},
  {id: 'Shot52', C: Shot52, frames: SHOT52_FRAMES},
  {id: 'Shot53', C: Shot53, frames: SHOT53_FRAMES},
  {id: 'Shot54', C: Shot54, frames: SHOT54_FRAMES},
  {id: 'Shot55', C: Shot55, frames: SHOT55_FRAMES},
  {id: 'Shot56', C: Shot56, frames: SHOT56_FRAMES},
  {id: 'Shot57', C: Shot57, frames: SHOT57_FRAMES},
];

const total = (list: typeof ACT1) => list.reduce((a, s) => a + s.frames, 0);

/** the film's soundtrack (generated by audio/make_audio.py); `from` = film frame where this reel starts */
const Soundtrack: React.FC<{from: number}> = ({from}) => <Audio src={staticFile('audio/mix.wav')} trimBefore={from} />;

const Reel: React.FC<{list: typeof ACT1; audioFrom?: number}> = ({list, audioFrom}) => (
  <>
    <Series>
      {list.map(({id, C, frames}) => (
        <Series.Sequence key={id} durationInFrames={frames} name={id}>
          <C />
        </Series.Sequence>
      ))}
    </Series>
    {audioFrom !== undefined && <Soundtrack from={audioFrom} />}
  </>
);

const Act1: React.FC = () => <Reel list={ACT1} audioFrom={0} />;
const Act2: React.FC = () => <Reel list={ACT2} audioFrom={total(ACT1)} />;
const Acts12: React.FC = () => <Reel list={[...ACT1, ...ACT2]} audioFrom={0} />;
const Act3: React.FC = () => <Reel list={ACT3} audioFrom={total(ACT1) + total(ACT2)} />;
const FILM = [...ACT1, ...ACT2, ...ACT3];
const Film: React.FC = () => <Reel list={FILM} audioFrom={0} />;

/** THE LONG VERSION (enhanced): same shots, but every place is a fully built room and the colour script follows
 *  the story (kit/film.tsx): warm childhood -> cold approval chase -> rock bottom -> dawn -> bright ending */
const shotNo = (id: string) => Number(id.replace('Shot', ''));
const FILM_SCRIPT = filmScript(FILM.map((s) => ({n: shotNo(s.id), frames: s.frames})), NOBODY_PLAN);
const HDReel: React.FC<{list: typeof ACT1; audioFrom?: number}> = ({list, audioFrom}) => {
  let acc = audioFrom ?? 0;
  return (
    <>
      <Series>
        {list.map(({id, C, frames}) => {
          const start = acc;
          acc += frames;
          return (
            <Series.Sequence key={id} durationInFrames={frames} name={id}>
              <FilmShot shot={shotNo(id)} start={start} plan={NOBODY_PLAN} script={FILM_SCRIPT}>
                <C />
              </FilmShot>
            </Series.Sequence>
          );
        })}
      </Series>
      {audioFrom !== undefined && <Soundtrack from={audioFrom} />}
    </>
  );
};
const FilmHD: React.FC = () => <HDReel list={FILM} audioFrom={0} />;
const FilmHDAct1: React.FC = () => <HDReel list={ACT1} audioFrom={0} />;

export const Root: React.FC = () => (
  <>
    <Composition id="Film" component={Film} durationInFrames={total(FILM)} fps={FPS} width={W} height={H} />
    <Composition id="FilmHD" component={FilmHD} durationInFrames={total(FILM)} fps={FPS} width={W} height={H} />
    <Composition id="FilmHD-Act1" component={FilmHDAct1} durationInFrames={total(ACT1)} fps={FPS} width={W} height={H} />
    <Composition id="Act1" component={Act1} durationInFrames={total(ACT1)} fps={FPS} width={W} height={H} />
    <Composition id="Act2" component={Act2} durationInFrames={total(ACT2)} fps={FPS} width={W} height={H} />
    <Composition id="Acts1-2" component={Acts12} durationInFrames={total(ACT1) + total(ACT2)} fps={FPS} width={W} height={H} />
    <Composition id="Act3" component={Act3} durationInFrames={total(ACT3)} fps={FPS} width={W} height={H} />
    <Composition id="CharTest" component={CharTest} durationInFrames={30} fps={FPS} width={W} height={H} />
    <Composition id="LookTest-9x16" component={LookTest} durationInFrames={LOOKTEST_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="Checks96" component={Checks96} durationInFrames={CHECKS96_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="Checks96Test" component={Checks96Test} durationInFrames={TEST_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="LookTest-16x9" component={LookTest} durationInFrames={LOOKTEST_FRAMES} fps={FPS} width={W} height={H} />
    {FILM.map(({id, C, frames}) => (
      <Composition key={id} id={id} component={C} durationInFrames={frames} fps={FPS} width={W} height={H} />
    ))}
  </>
);
