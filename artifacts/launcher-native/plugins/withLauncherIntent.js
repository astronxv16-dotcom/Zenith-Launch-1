const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Config plugin that adds HOME launcher intent filter to MainActivity.
 * This allows the app to be set as the Android home screen launcher.
 */
function withLauncherIntent(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application[0];

    if (!application || !application.activity) return config;

    // Find MainActivity
    const mainActivity = application.activity.find(
      (activity) =>
        activity.$['android:name'] === '.MainActivity' ||
        activity.$['android:name'] === 'com.focuslauncher.MainActivity'
    );

    if (!mainActivity) return config;

    // Ensure intent-filter array exists
    if (!mainActivity['intent-filter']) {
      mainActivity['intent-filter'] = [];
    }

    // Check if HOME filter already exists
    const hasHomeFilter = mainActivity['intent-filter'].some((filter) => {
      const categories = filter.category || [];
      return categories.some(
        (cat) => cat.$['android:name'] === 'android.intent.category.HOME'
      );
    });

    if (!hasHomeFilter) {
      mainActivity['intent-filter'].push({
        action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
        category: [
          { $: { 'android:name': 'android.intent.category.HOME' } },
          { $: { 'android:name': 'android.intent.category.DEFAULT' } },
        ],
      });
    }

    return config;
  });
}

module.exports = withLauncherIntent;
