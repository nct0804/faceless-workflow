/** look-dev stills for the new sets: frame N = view N (render with `remotion still ... --frame=N`) */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Stage} from '../../kit3d/Stage';
import {BEDROOM, BedroomNight, Island, ISLANDS, STADIUM, StadiumNight, useStadium} from '../../kit3d/envs';
import {CrowdInstances, stadiumSeats} from '../../kit3d/Crowd';
import {Character, POSES} from '../../kit3d/Character';
import {Phone3D, Sketchbook, Pencil, drawLikesBig} from '../../kit3d/Props';
import {drawPage, DRAGON} from '../../kit/canvas';

const StadiumView: React.FC<{v: number}> = ({v}) => {
  const set = useStadium();
  const seats = React.useMemo(() => stadiumSeats(set?.markData.MARK_stands), [set]);
  const cams = [
    {pos: [0, 1.4, 9] as [number, number, number], target: [0, 2.2, 0] as [number, number, number], fov: 50},
    {pos: [0, 13, 13] as [number, number, number], target: [0, 0, 0] as [number, number, number], fov: 45},
    {pos: STADIUM.seat(5, 20, 1.0), target: STADIUM.seat(4, 0, 0.5), fov: 45},
  ];
  const cam = cams[v];
  return (
    <Stage background={STADIUM.bg} fog={STADIUM.fog} cam={{...cam, shake: 0}} post={{bloom: 0.9, aperture: v === 2 ? 1 : 0.3, focusAt: v === 2 ? STADIUM.seat(4, 0, 0.6) : [0, 1.2, 0]}}>
      <StadiumNight set={set}>
        <CrowdInstances seats={seats} look={[0, 1.2, 0]} down={v === 2 ? 1 : 0} />
        <Character id="mo" position={STADIUM.center} rotation={0} pose={{armL: 14, armR: 14}} face={{mood: 'worried', lookY: 0.4}} />
      </StadiumNight>
    </Stage>
  );
};

export const TEST_FRAMES = 6;
export const Checks96Test: React.FC = () => {
  const v = useCurrentFrame();
  if (v <= 2) return <AbsoluteFill><StadiumView v={v} /></AbsoluteFill>;
  if (v === 3)
    return (
      <Stage background={ISLANDS.class.bg} fog={[ISLANDS.class.bg, 3, 9]} cam={{pos: [-6.2, 1.3, 2.6], target: [-7, 0.9, 0.3], fov: 45, shake: 0}} post={{aperture: 0.6, focusAt: [-7, 1.1, 0.7]}}>
        <Island name="class">
          <Character id="mo" position={ISLANDS.class.mo} rotation={180 - 20} pose={{...POSES.holdPhoneLow, sit: 1}} face={{mood: 'neutral', lookY: -0.8}} />
        </Island>
      </Stage>
    );
  const B = BEDROOM;
  return (
    <Stage background={B.bg} fog={B.fog} cam={{pos: [0.2, 1.45, -0.2], target: [-0.95, 0.85, -1.95], fov: 45, shake: 0}} post={{aperture: 0.8, focusAt: [-0.95, 0.8, -1.95]}}>
      <BedroomNight hide={['ceiling', 'laptop']}>
        <Character id="mo" position={B.moDesk} rotation={B.moDeskYaw} pose={{sit: 1, fwdR: 55, elbowR: 40, fwdL: 40, elbowL: 50, armL: 10, headNod: 30, lean: 12}} face={{mood: 'determined', lookY: -1}} />
        <Sketchbook at={[-0.95, B.deskTop, -1.97]} draw={(ctx, w, h) => drawPage(ctx, w, h, DRAGON, 'mon', 0.8)} />
        <Pencil at={[-0.8, B.deskTop + 0.01, -1.9]} rot={[30, 0, 0]} />
        <Phone3D at={[-0.55, B.deskTop + 0.006, -1.92]} rot={[-90, 0, 0]} screen={(ctx, w, h) => drawLikesBig(ctx, w, h, {likes: 9})} />
      </BedroomNight>
    </Stage>
  );
};
