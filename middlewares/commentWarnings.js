const commentWarn = async (user) => {
  user.warnings = (user.warnings || 0) + 1;
  const WARNING_LIMIT = 3;
  const DISABLE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  if (user.warnings >= WARNING_LIMIT) {
    user.isCommentDisabled = true;
    user.commentDisabledUntil = new Date(Date.now() + DISABLE_DURATION);
  }

  await user.save();
  return user;
};

module.exports = commentWarn ;