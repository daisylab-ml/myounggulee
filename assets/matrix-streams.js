const CODE_BLOCKS = [
  [
    "def analyze(data):",
    "  for i, x in enumerate(data):",
    "    if x > 0:",
    "      return model.predict(x)",
  ],
  [
    "data = [0.23, 0.56, 0.12]",
    "results = []",
    "for d in data:",
    "  results.append(analyze(d))",
  ],
  [
    "class DataPipeline:",
    "  def process(self, x):",
    "    return self.model(x)",
  ],
  [
    "import numpy as np",
    "from sklearn.model_selection import train_test_split",
    "def train(model, X, y):",
    "  model.fit(X, y)",
  ],
  [
    "X_train, X_test = train_test_split(X, y)",
    "preds = model.predict(X_test)",
    "score = np.mean(preds == y_test)",
    "print(\"Accuracy:\", score)",
  ],
  [
    "response = await api.get(\"/data\")",
    "const insights = { users: 1024 }",
    "for market in platforms:",
    "  optimize(strategy, evidence)",
  ],
];

export const STREAM_TOKENS = Object.freeze({
  mobileBreakpoint: 640,
  codeEdgeRatio: 0.32,
  binaryEdgeRatio: 0.29,
  binaryStreamSpacingMobile: 18,
  binaryStreamSpacingDesktop: 20,
  typingSpeedMin: 11,
  typingSpeedRange: 13,
  codeDriftSpeedMin: 8,
  codeDriftSpeedRange: 10,
  binaryDriftSpeedMin: 11,
  binaryDriftSpeedRange: 18,
  cursorBlinkInterval: 420,
});

function seededNoise(seed) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function createCodeStream({
  blockIndex,
  lineIndex,
  text,
  x,
  y,
  height,
  staticFrame,
}) {
  const typingSpeed =
    STREAM_TOKENS.typingSpeedMin +
    seededNoise(blockIndex + lineIndex + 3.2) * STREAM_TOKENS.typingSpeedRange;
  const initialProgress = staticFrame
    ? 0.72 + seededNoise(blockIndex + lineIndex + 4.6) * 0.28
    : seededNoise(blockIndex + lineIndex + 4.6) * 0.82;

  return {
    x,
    y,
    text,
    typed: text.length * initialProgress,
    typingSpeed,
    driftSpeed:
      STREAM_TOKENS.codeDriftSpeedMin +
      seededNoise(blockIndex + 9.4) * STREAM_TOKENS.codeDriftSpeedRange,
    alpha: 0.64 + seededNoise(blockIndex + lineIndex + 11.7) * 0.3,
    tone:
      lineIndex === 0 ? "cursor" : lineIndex % 3 === 0 ? "slate" : "indigo",
    delay: staticFrame ? 0 : lineIndex * 0.22,
    blockIndex,
    blockSize: CODE_BLOCKS[blockIndex].length,
    lineIndex,
    height,
  };
}

export function createCodeStreams(width, height, staticFrame) {
  const blockCount = width < 640 ? 4 : width < 900 ? 5 : CODE_BLOCKS.length;
  const rowsPerSide = Math.ceil(blockCount / 2);
  const verticalStep = Math.max(150, (height - 100) / rowsPerSide);

  return CODE_BLOCKS.slice(0, blockCount).flatMap((block, blockIndex) => {
    const side = blockIndex % 2;
    const row = Math.floor(blockIndex / 2);
    const sideWidth = width * STREAM_TOKENS.codeEdgeRatio;
    const inset = 12 + seededNoise(blockIndex + 1.8) * sideWidth * 0.16;
    const x = side === 0 ? inset : width - sideWidth + inset;
    const baseY = 54 + row * verticalStep;
    return block.map((text, lineIndex) =>
      createCodeStream({
        blockIndex,
        lineIndex,
        text,
        x,
        y: baseY + lineIndex * 21,
        height,
        staticFrame,
      }),
    );
  });
}

function createBinaryStream(index, width, height) {
  const side = index % 2;
  const sideWidth = width * STREAM_TOKENS.binaryEdgeRatio;
  const lane = 0.06 + seededNoise(index + 21.2) * 0.88;
  return {
    index,
    x: side === 0 ? lane * sideWidth : width - lane * sideWidth,
    offset: seededNoise(index + 22.8) * height,
    speed:
      STREAM_TOKENS.binaryDriftSpeedMin +
      seededNoise(index + 24.4) * STREAM_TOKENS.binaryDriftSpeedRange,
    alpha: 0.42 + seededNoise(index + 26.1) * 0.35,
  };
}

export function createBinaryStreams(width, height) {
  const spacing =
    width < STREAM_TOKENS.mobileBreakpoint
      ? STREAM_TOKENS.binaryStreamSpacingMobile
      : STREAM_TOKENS.binaryStreamSpacingDesktop;
  const count = Math.max(12, Math.min(52, Math.round(width / spacing)));
  return Array.from({ length: count }, (_, index) =>
    createBinaryStream(index, width, height),
  );
}
