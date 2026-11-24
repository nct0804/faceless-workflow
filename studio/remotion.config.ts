import {Config} from '@remotion/cli/config';

// WebGL in headless Chrome on macOS
Config.setChromiumOpenGlRenderer('angle');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setConcurrency(4);
