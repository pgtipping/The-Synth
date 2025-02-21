interface FeatureFlags {
  OPTIMIZED_QUILL_IMPORT: boolean;
  CHUNK_OPTIMIZATION: boolean;
}

export const FEATURES: FeatureFlags = {
  OPTIMIZED_QUILL_IMPORT:
    process.env.NEXT_PUBLIC_OPTIMIZED_QUILL_IMPORT === 'true',
  CHUNK_OPTIMIZATION: process.env.NEXT_PUBLIC_CHUNK_OPTIMIZATION === 'true',
};

export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return FEATURES[feature] ?? false;
}

// Development helper to toggle features
if (process.env.NODE_ENV === 'development') {
  (window as any).__toggleFeature = (feature: keyof FeatureFlags) => {
    FEATURES[feature] = !FEATURES[feature];
    console.log(
      `Feature ${feature} is now ${FEATURES[feature] ? 'enabled' : 'disabled'}`
    );
  };
}
