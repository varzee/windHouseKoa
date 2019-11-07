// import Koa from 'koa'
const Koa = require("koa");
const app = new Koa();

const router = require("koa-router")();
const bodyParser = require("koa-bodyparser");
const logger = require("./middleware/logger");
const DB = require("./db");
const cors = require('@koa/cors');

const getHouseInfo = require('./controller/sendEmail')


app.use(logger());
app.use(bodyParser());
app.use(cors());


router
.get('/getInfo', async (ctx,next) => {
	let res = await DB.find();
	ctx.body = {
		success: true,
		data: res,
		mesasge: 'success'
	}
	await next();
})
.post('/subscribe', async (ctx,next) => {
	const {name, phone, email, sub_area} = ctx.request.body
	await DB.create({name, phone, email, sub_area, last_send_area: []});
	ctx.body = {
		success: true,
		mesasge: 'success'
	}
	await next()
})
app.use(router.routes()).use(router.allowedMethods());

app.listen(9999, () => {
	getHouseInfo();
});
console.log('服务已启动，端口：9999');
