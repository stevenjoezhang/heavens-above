# Heavens Above

爬取 Heavens Above 网站，获取卫星过境等信息。基于 Node.js，需使用 `npm` 安装依赖。  
Scripts for scraping the Heavens Above website. It's based on Node.js. You may need to install some dependency packages using npm.

**警告：不支持 IE。**  
**WARNING: DO NOT SUPPORT IE.**

## To Use

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download) (which comes with [npm](http://npmjs.com)) installed on your computer. `Promise.allSettled` requires Node.js 12.10.0 or later. From your command line:
```bash
# Clone this repository
git clone https://github.com/PKUPI/heavens-above.git
# Go into the repository
cd heavens-above
# Install dependencies
npm install
# Run the app
node run.js
```

`public` 目录下是一个完整的网站，爬取的数据会存储在 `public/data` 目录下，通过网络服务器访问 `public/index.html` 即可查看数据的内容。  
将 `node run.js` 添加到 `crontab`，以每周或每月一次的频率执行，则可以始终获取最新数据。

## Credits

* [Mimi](https://zhangshuqiao.org) Developer of this project.  
* Inspired by https://github.com/chengxinlun/haQuery

## License

Released under the GNU General Public License v3  
http://www.gnu.org/licenses/gpl-3.0.html

## Todo List

=\_=
User Customize
