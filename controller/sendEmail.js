const cheerio = require("cheerio");
const charset = require("superagent-charset");
const superagent = charset(require("superagent"));
const nodemailer = require("nodemailer");
const DB = require("../db");

const url = "https://www.cdfangxie.com/Infor/type/typeid/36.html";
const time = 15 * 1000; //

// 邮件配置
const transporter = nodemailer.createTransport({
	host: "smtpdm.aliyun.com",
	port: 25,
	secureConnection: true, // use SSL, the port is 465
	auth: {
		user: "zx@varzee.cn", // user name
		pass: "ZhuXun8292313" // password
	}
});

let mailOptions = {
	from: "zx@varzee.cn", // sender address mailfrom must be same with the user
	to: "", // list of receivers
	subject: "成都新房源提醒", // Subject line
	text: "成都新房源提醒", // plaintext body
	html: "" // html body
};
let allData = [];

let timer = null;

// 定时获取
function start() {
  getAllData();
	timer = setInterval(getAllData, time);
}

// 获取所有房源数据
function getAllData() {
	superagent
		.get(url)
		.charset("utf-8")
		.buffer(true)
		.end((err, data) => {
			try {
				const htmlData = data.text;
				const $ = cheerio.load(htmlData);
				allData = [];
				$(".right_cont li").each((index, element) => {
					let info = $(element).find("span").eq(0).text();
					if (!info) return;
					let date = $(element).find("span").eq(1).text();
					allData.push({
						area: info.split("|")[0],
						name: info.split("|")[1],
						date: date});
                });
        send();
			} catch (err) {
				console.log("error! restore...", err);
				clearInterval(timer);
				start();
			}
		});
}
// 获取当天的房源信息
function getTodayAreaInfo() {
  const day = new Date().getDate();
  const month = new Date().getMonth() + 1;
  return allData.filter(v => v.date === `${month > 9 ? month : '0'+month}-${day > 9 ? day : '0'+day}`)
}
// 获取用户订阅区域最新信息
function getUserData(user) {
  let todayData = getTodayAreaInfo()
  let userData = todayData.filter(v => {
    return isUserArea(user.sub_area, v.area) && isNewInfo(user.last_send_area, v.name)
  });
  return userData;
}

// 是否是用户订阅区域
function isUserArea(subArea, area) {
	return subArea.includes(area);
}
// 是否是未发送过的消息
function isNewInfo(sendArea, name) {
  return !sendArea.includes(name)
}

// 邮件内容格式
function getContent(userData) {
  let content = '';
  for (let info of userData) {
		content += `【${info.area}】${info.name} 时间：${info.date}<br>`;
	};
  return content
}


//发送邮件
async function sendMail(user, content, userData) {
	mailOptions.html = `<b>${content}</b>`;
  mailOptions.to = user.email;
	transporter.sendMail(mailOptions, async function(error, info) {
		if (error) {
			console.log("send error info:" + error);
			//发送失败 则过三秒重新发送
			return setTimeout(() => {
				sendMail(content, user.email);
			}, 3000);
    }
    const sendArea = userData.map(v => v.name);
    const last_send_area = sendArea
    await DB.updateMany({phone: user.phone}, { last_send_area })
  })
}

// 发送
async function send() {
  let subscribers = await DB.find();
	for (let i = 0; i < subscribers.length; i++) {
    const userData = getUserData(subscribers[i]);
    if(userData.length < 1) {
      continue;
    }
    const content = getContent(userData);
		if (content) sendMail(subscribers[i], `${content}`, userData);
	}
}


module.exports = start