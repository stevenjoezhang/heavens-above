# Heavens Above

爬取Heavens Above网站。基于Node.js。  
Scripts for scraping the Heavens Above website. It's based on Node.js. You may need to install some dependency packages using npm.

**警告：不支持IE。**  
**WARNING: DO NOT SUPPORT IE.**

## To Use
To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:
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
通过网络服务器访问`data`目录下的内容即可查看爬取的数据。具体来说，在访问`index.html`时，就可以加载你需要的数据。  
将`node run.js`添加到`crontab`（例如以每周或每月一次的频率执行），则可以始终获取最新数据。

## Credits
* [Mimi](https://zhangshuqiao.org) Developer of this project.  
* Inspired by https://github.com/chengxinlun/haQuery

## License
Released under the GNU General Public License v3  
http://www.gnu.org/licenses/gpl-3.0.html

## Todo List
=\_=
User Customize
