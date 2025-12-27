# 📹 One Piece Video & Manga Setup

## Video Setup

To add One Piece video backgrounds:

1. **Download a One Piece video** (MP4 format recommended)
   - Suggested: Fight scenes, epic moments, or background animations
   - Keep file size reasonable (< 50MB for web)
   - Recommended resolution: 1920x1080 or 1280x720

2. **Place video file:**
   ```
   typing-speed-battle/public/videos/one-piece-bg.mp4
   ```

3. **Update AnimeBackground component:**
   ```jsx
   <AnimeBackground videoSrc="/videos/one-piece-bg.mp4">
     {/* Your content */}
   </AnimeBackground>
   ```

## Manga Images Setup

To add One Piece manga panels:

1. **Download manga panel images** (PNG/JPG)
   - Extract panels from manga pages
   - Recommended size: 200x200px to 400x400px
   - Use transparent PNGs for better blending

2. **Place images in:**
   ```
   typing-speed-battle/public/images/manga/
   ```

3. **Update AnimeBackground component:**
   ```jsx
   <AnimeBackground 
     mangaImages={[
       '/images/manga/panel1.png',
       '/images/manga/panel2.png',
       '/images/manga/panel3.png',
     ]}
   >
     {/* Your content */}
   </AnimeBackground>
   ```

## Legal Note

⚠️ **Important**: Only use videos/images you have permission to use:
- Official One Piece content from licensed sources
- Your own created content
- Content with proper licensing

Do not use copyrighted material without permission.

## Video Sources (Legal)

- Official One Piece YouTube channel
- Crunchyroll (with proper licensing)
- Create your own animations
- Use royalty-free anime-style backgrounds

## Recommended Video Types

- Background loops (no audio needed)
- Fight scene highlights
- Character introductions
- Epic moments (Gear transformations, etc.)

