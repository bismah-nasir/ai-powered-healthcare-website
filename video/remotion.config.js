import { Config } from '@remotion/cli/config';

Config.setEntryPoint('src/index.js');
Config.setCodec('h264');
Config.setCrf(18); // High quality: UI text stays sharp
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
