// Mock for react-native-worklets/plugin — required by react-native-reanimated Babel plugin
// during Jest transform. We don't need worklet transformation in tests.
module.exports = function () {
  return {
    visitor: {},
  };
};
