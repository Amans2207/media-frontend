import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

let ffmpeg = null;

export const initFFmpeg = async () => {
    if (!ffmpeg) {
        ffmpeg = createFFmpeg({ 
            log: true,
            corePath: '/ffmpeg/ffmpeg-core.js'
        });
        await ffmpeg.load();
        
        // Load the font file for subtitles
        try {
            const fontData = await fetchFile('/fonts/TikTokFont.ttf');
            ffmpeg.FS('writeFile', 'TikTokFont.ttf', fontData);
        } catch (e) {
            console.error("Failed to load font:", e);
        }
    }
    return ffmpeg;
};

export const runClientSideFFmpeg = async (videoFileOrUrl, options, setProgress) => {
    const ffmpeg = await initFFmpeg();
    
    let lastPercent = -1;
    ffmpeg.setProgress(({ ratio }) => {
        const percent = Math.round(ratio * 100);
        if (percent !== lastPercent && percent >= 0 && percent <= 100) {
            lastPercent = percent;
            setProgress(percent);
        }
    });

    const inputName = 'input.mp4';
    const outputName = `output.${options.exportFormat === 'gif' ? 'gif' : (options.exportFormat === 'mp3' ? 'mp3' : 'mp4')}`;

    // Write input video to FS
    ffmpeg.FS('writeFile', inputName, await fetchFile(videoFileOrUrl));

    // Handle Custom Audio
    let hasAudio = false;
    if (options.customAudio) {
        ffmpeg.FS('writeFile', 'audio.mp3', await fetchFile(options.customAudio));
        hasAudio = true;
    }

    // Handle Captions
    if (options.clientSrt) {
        ffmpeg.FS('writeFile', 'captions.srt', options.clientSrt);
    }

    let ffmpegArgs = ['-y'];

    if (options.exportFormat === 'gif') {
        ffmpegArgs.push('-i', inputName);
    } else {
        ffmpegArgs.push('-i', inputName);
        if (hasAudio) {
            ffmpegArgs.push('-i', 'audio.mp3');
        }
    }

    if (options.exportFormat === 'mp3') {
        ffmpegArgs.push('-vn', '-c:a', 'libmp3lame', '-b:a', '320k', outputName);
        await ffmpeg.run(...ffmpegArgs);
        const data = ffmpeg.FS('readFile', outputName);
        return new Blob([data.buffer], { type: 'audio/mp3' });
    }

    // Video/GIF processing
    let vfFilters = [];
    let afFilters = [];

    // 1. Remove Watermark
    if (options.removeWatermark) {
        const vw = options.videoWidth || 1080;
        const vh = options.videoHeight || 1920;
        
        let tlW = Math.min(180, vw - 30);
        let tlH = Math.min(50, vh - 30);
        let tlX = 15;
        let tlY = 15;
        
        let brW = Math.min(180, vw - 30);
        let brH = Math.min(50, vh - 30);
        let brX = Math.max(0, vw - brW - 15);
        let brY = Math.max(0, vh - brH - 15);

        vfFilters.push(`delogo=x=${tlX}:y=${tlY}:w=${tlW}:h=${tlH}`, `delogo=x=${brX}:y=${brY}:w=${brW}:h=${brH}`);
    }

    // 2. Scale / Crop
    const crop = options.crop || 'none';
    if (crop === 'none') {
        if (options.exportFormat !== 'gif') {
            if (options.compressWhatsApp) {
                vfFilters.push("scale=-2:480");
            } else {
                vfFilters.push("scale=-2:720");
            }
        }
    }

    // 3. Cinematic Filters
    const videoFilter = options.videoFilter || 'none';
    if (videoFilter === 'cinematic_pro') {
        vfFilters.push("eq=contrast=1.2:saturation=1.25:gamma=0.9,colorbalance=rs=0.2:bs=-0.15:rm=0.15:bm=-0.1:gs=-0.05:rh=0.05:bh=0.1,vignette");
    } else if (videoFilter === 'vintage_film') {
        vfFilters.push("eq=saturation=0.6:contrast=1.3:brightness=0.05:gamma=1.1,colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131:0,unsharp=5:5:-1:5:5:-1,vignette=PI/4");
    } else if (videoFilter === 'vhs_glitch') {
        vfFilters.push("eq=saturation=1.5:contrast=1.3,rgbashift=rh=5:bh=-5:gv=3:bv=-2,unsharp=5:5:-1.5:5:5:-1.5");
    } else if (videoFilter === 'moody_dark') {
        vfFilters.push("eq=brightness=-0.15:contrast=1.4:saturation=0.6:gamma=0.8,vignette");
    } else if (videoFilter === 'dreamy_bloom') {
        vfFilters.push("unsharp=13:13:-3.0:13:13:-2.0,eq=saturation=1.4:contrast=1.05:brightness=0.08:gamma=1.1");
    } else if (videoFilter === 'hdr_pro') {
        vfFilters.push("unsharp=7:7:2.5:7:7:1.0,eq=saturation=1.45:contrast=1.25:gamma=0.95");
    }

    if (options.reverse) vfFilters.push("reverse");
    if (options.speed && options.speed !== 1.0) vfFilters.push(`setpts=${(1/options.speed).toFixed(2)}*PTS`);

    // 4. Subtitles
    if (options.clientSrt && options.exportFormat !== 'gif') {
        vfFilters.push(`subtitles=captions.srt:fontsdir=/:force_style='Fontname=Anton,Fontsize=22,PrimaryColour=&H0000FFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=4,Shadow=1,Alignment=2,MarginV=40'`);
    }

    // Process Crop Logic
    let finalVMap = "0:v:0";
    let finalAMap = null;
    let filterComplexParts = [];

    if (crop !== 'none') {
        let targetW = 720, targetH = 1280;
        if (crop === '1:1') { targetW = 720; targetH = 720; }
        else if (crop === '16:9') { targetW = 1280; targetH = 720; }
        
        if (options.compressWhatsApp) {
            targetW = 480; targetH = 854;
        }

        const bgW = Math.floor(targetW / 3);
        const bgH = Math.floor(targetH / 3);
        const baseFilter = vfFilters.length > 0 ? vfFilters.join(',') : 'null';

        let vFilter = `[0:v]${baseFilter},split=2[base1][base2];[base1]scale=${bgW}:${bgH}:force_original_aspect_ratio=increase,crop=${bgW}:${bgH},boxblur=15:15,scale=${targetW}:${targetH}[bg];[base2]scale=${targetW}:${targetH}:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2[outv]`;

        if (options.exportFormat === 'gif') {
            vFilter += `;[outv]split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse[gifout]`;
            finalVMap = "[gifout]";
        } else {
            finalVMap = "[outv]";
        }
        filterComplexParts.push(vFilter);
    } else {
        if (options.exportFormat === 'gif') {
            if (vfFilters.length > 0) {
                filterComplexParts.push(`${vfFilters.join(',')},split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse[gifout]`);
            } else {
                filterComplexParts.push(`split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse[gifout]`);
            }
            finalVMap = "[gifout]";
        } else {
            if (vfFilters.length > 0) {
                ffmpegArgs.push('-vf', vfFilters.join(','));
            }
            finalVMap = "0:v:0";
        }
    }

    // Audio Filters
    if (options.reverse) afFilters.push("areverse");
    if (options.speed && options.speed !== 1.0) afFilters.push(`atempo=${options.speed}`);

    const trimStart = options.trimStart || 0;
    const trimEnd = options.trimEnd || 0;
    const duration = options.duration || 0;
    if (trimStart > 0 || (duration > 0 && trimEnd < duration)) {
        ffmpegArgs.push('-ss', String(trimStart), '-to', String(trimEnd));
    }

    if (options.exportFormat !== 'gif') {
        if (options.mute && !hasAudio) {
            ffmpegArgs.push('-an');
        } else if (hasAudio) {
            if (options.mute) {
                finalAMap = '1:a:0';
                if (options.customAudioOffset > 0) {
                    const delayMs = Math.round(options.customAudioOffset * 1000);
                    afFilters.push(`adelay=${delayMs}|${delayMs}`);
                }
                if (options.customAudioEnhance) {
                    afFilters.push("bass=g=6:f=110:w=0.6,treble=g=5:f=10000:w=0.5,extrastereo=m=2.0,crystalizer=i=1.5,volume=1.5");
                }
                if (afFilters.length > 0) ffmpegArgs.push('-af', afFilters.join(','));
                ffmpegArgs.push('-shortest');
            } else {
                let mixFilter = `[0:a]volume=1.5[a0];[1:a]volume=0.25`;
                
                const audioOffset = options.customAudioOffset || 0;
                if (audioOffset > 0) {
                    const delayMs = Math.round(audioOffset * 1000);
                    mixFilter += `,adelay=${delayMs}|${delayMs}`;
                }
                if (options.customAudioEnhance) {
                    mixFilter += `,bass=g=6:f=110:w=0.6,treble=g=5:f=10000:w=0.5,extrastereo=m=2.0,crystalizer=i=1.5`;
                }
                mixFilter += `[a1];[a0][a1]amix=inputs=2:duration=first:dropout_transition=2[aout]`;
                
                if (afFilters.length > 0) {
                    mixFilter += `;[aout]${afFilters.join(',')}[afinal]`;
                    finalAMap = '[afinal]';
                } else {
                    finalAMap = '[aout]';
                }
                filterComplexParts.push(mixFilter);
                ffmpegArgs.push('-shortest');
            }
        } else {
            finalAMap = '0:a?';
            if (afFilters.length > 0) ffmpegArgs.push('-af', afFilters.join(','));
        }
    }

    if (filterComplexParts.length > 0) {
        ffmpegArgs.push('-filter_complex', filterComplexParts.join(';'));
    }
    ffmpegArgs.push('-map', finalVMap);
    if (finalAMap) ffmpegArgs.push('-map', finalAMap);

    if (options.exportFormat === 'gif') {
        ffmpegArgs.push('-loop', '0', outputName);
    } else {
        if (options.compressWhatsApp) {
            ffmpegArgs.push('-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '32', '-profile:v', 'main', '-c:a', 'aac', '-b:a', '96k', '-threads', '1', outputName);
        } else {
            ffmpegArgs.push('-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '20', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '320k', '-threads', '1', outputName);
        }
    }

    await ffmpeg.run(...ffmpegArgs);
    const data = ffmpeg.FS('readFile', outputName);
    const mime = options.exportFormat === 'gif' ? 'image/gif' : 'video/mp4';
    return new Blob([data.buffer], { type: mime });
};
