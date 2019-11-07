function log(ctx) {
  console.log( 'logInfo: ', ctx.method, ctx.header.host + ctx.url )
}
module.exports = function() {
  return async function(ctx,next) {
    log(ctx)
    await next()
  }
}