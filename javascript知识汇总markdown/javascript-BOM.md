BOM
================

#### window对象

   1. #### Global 作用域

   window 对象被复用为ECMAScript 的 global对象，所以通过var 声明的所有全局变量和函数都会变成window对象的属性和方法。

   ```javascript
   var age = 29;
   var sayAge = () => alert(this.age);

   alert(window.age); // 29
   sayAge();
   window.sayAge();
   ```

      如果在这里使用let 或者const 替代 var，则不会把变量添加给全局对象：

   ```javascript
   let age = 29;
   const sayAge = () => alert(this.age);
   alert(window.age);  // undefined
   sayAge(); // undefined
   window.sayAge(); // TypeError: window.sayAge is not a function
   ```

   2. ##### 窗口关系

   ``` javascript
   window === window.self  // true
   window === window.top	// true
   window === window.parent // true
   ```



   3. ##### 窗口位置与像素比

   ```javascript
   // 把窗口移动到左上角
   
   window.moveTo(0,0);
   
   // 把窗口移动到右上角
   
   window.moveBy(0, 100);
   ```

   4. ##### 窗口大小

   ```javascript
   let pageWidth = window.innerWidth,
       pageHeight = window.innerHeight;
   // 浏览器有两种模式
   // 标准(严格)模式 document.compatMode 值为: "CSS1Compat": 标准模式
   // 怪异(混杂)模式 document.compatMode 值为： “BackCompat”: 怪异模式
   
   if (typeof pageWidth != "number") {
       // 如果浏览器当前的
       if (document.compatModee == "css1Comapt") {
           pageWidth = document.documentElement.clientWidth;
           pageHeight = document.documentElement.clientHeight;
       } else {
           pagewidth = document.body.clientWidth;
           pageHeight = document.body.clientHeight;
       }
   }
   ```

   5. ##### 视口位置

   ```javascript
   // 相对于当前视口向下滚动100 像素
   window.scrollBy(0,100)
   // 相对于当前视口向右滚动 40 像素
   window.scrollTo(40,0)
   // 滚动到页面左上角
   window.scrollTo(0,0)
   ```

   6. ##### 导航与打开新窗口

   ```javascript
   window.open("http://www.wrow.com/","topFrame");
   ```

   

   7. ##### 定时器

   ```javascript
   // 设置超时任务
   let timeoutId = setTimeout(() => alert("Hello world!"), 1000);
   // 取消超时任务
   clearTimeout(timeoutId);
   ```

   8. ##### 系统对话框

   ```javascript
   if (confirm("Are you sure?")) {
       alert("I'm so glad you're sure!");
   } else {
       alert("I'm sorry to hear you're not sure")
   }
   ```

#### location 对象

它既是window的属性，也是document的属性。也就是说，window.location 和 document.location 指向同一个对象

```javascript
window.location === document.location
```

| 属性              | 值                                 | 说明                                                    |
| :---------------- | :--------------------------------- | :------------------------------------------------------ |
| location.hash     | "#conetent"                        | URL散列值（井号后跟零或多个字符），如果没有则为空字符串 |
| location.host     | "www.wrox.com:80"                  | 服务器名及端口号                                        |
| location.hostname | "www.wrox.com"                     | 服务器名                                                |
| location.href     | "http://www.wrox.com:80/wileyCDA/" | 当前加载页面的完整URL。                                 |
| location.pathname | "/WileyCAD"                        | URL中的路径和（或者）文件名                             |
| location.port     | "80"                               | 请求的端口                                              |
| location.protocal | "http:"                            | 页面使用的协议。通常是“http:” 或“https:”                |
| location.search   | "?q=javascript"                    | URL的查询字符串。这个字符以问好开头                     |
| location.username | "foouser"                          | 域名前指定的用户名                                      |
| location.password | "barpassword"                      | 域名前指定的密码                                        |
| location.origin   | "http://www.wrox.com"              | URL 的源地址。只读                                      |

   1. ##### 查询字符串

   ```javascript
   let getQueryStringArgs = function() {
       // 取得没有开头问号的查询字符串
       let qs = (location.search.length > 0 ? location.search.substring(1) : ''),
           args = {};
       // 把每个参数添加到args对象
       for (let item of qs.split("&").map(kv => kv.split("="))) {
           let name = decodeURIComponent(item[0),
               value = decodeURIComponent(item[1]);
           if (name.length) {
               args[name] = value;
           }
       }
       return args;
   }
   // 假设查询字符串为 ?q=javascript&num=10
   
   let args = getQueryStringArgs();
   alert(args["q"]); // "javascript"
   alert(args["num"]); // "10"
   ```

   URLSearchParams 提供了一组标准API方法

   ```javascript
   let qs = "?q=javascript&num=10";
   
   let searchParams = new URLSearchParams(qs);
   
   alert(searchParams.toString()); // "q=javascript&num=10"
   searchParams.has("num");  // true
   searchParams.get("num");  // 10
   searchParams.set("page","3")
   alert(searchParams.toString()); //  "num=10&page=3"
   
   // 大多数支持URLSearchParams的浏览器也支持将URLSearchParams的实例用作可迭代对象：
   let qs = "?q=javascript&num=10";
   let searchParams = new URLSearchParams(qs);
   
   for (let param of seachParams) {
       console.log(param);
   }
   // ["q", "javascript"]
   // ["num", "10"]
   
   ```

2. ###### 操作地址

   ```javascript
   
   location.assgin("http://www.wrox.com");
   
   // 这行代码会立即启动导航到新URL的操作,同时在浏览器历史记录中增加一条记录。如果给location.href或window.location设置一个URL，也会以同一个URL值调用assign方法。比如:
   
   window.location = "http://www.wrox.com";
   window.href = "http://www.wrox.com"; // 这种方法是最常见的。
   
   // 假设当前URL为http://www.wrox.com/WileyCDA/
   
   // 把URL修改为 http://www.wrox.com/WilleyCDA/#section1
   location.hash = "#section1";
   
   // 把URL修改为http://www.wrox.com/WilleyCDA/?q=javascript
   location.search = "?q=javascript";
   
   // 把URL修改为http://www.somewhere.com/WileyCDA/
   location.hostname = "www.somewhere.com";
   
   // 把URL修改为http://www.somewhere.com/mydir/
   location.pathname = "mydir";
   
   // 把URL修改为http:// www.somewhere.com:8080/WileyCDA/
   location.port = 8080;
   
   // 除了hash之外， 只要修改location的一个属性，就会导致页面重新加载新URL。
   
   // 调用location.replace()之后，用户不能回到前一页。
   // location.reload(); // 重新加载，可能是从缓存加载
   // location.reload(true); // 重新加载，从服务器加载
   
   ```

#### navigator 对象

| 属性/方法  | 说明                               |
| ---------- | ---------------------------------- |
| appName    | 浏览器全名                         |
| appVersion | 浏览器版本。通常与实际浏览器不一致 |
| language   | 浏览器的主语言                     |
| platform   | 返回浏览器运行的系统平台           |
| userAgent  | 返回浏览器的用户代理字符串         |
| vendor     | 返回浏览器的厂商名称               |
| ...        |                                    |

// 插件检测，IE10 及更低版本无效

```javascript
let hasPlugin = function(name) {
    name = name.toLowerCase();
    
    for (let plugin of window.navigator.plugins){
        if (plugin.name.toLowerCase().indexOf(name) > -1){
            return true;
        }
    }
    return false;
}

// 检测 Flash
alert(hasPlugin("Flash"));
// 检测 QuickTime
alert(hasPlugin("QuickTime"));

```



let hasPlugin = function(name) {

}

#### screent 对象

| 属性         | 说明                                         |
| ------------ | -------------------------------------------- |
| availHeight  | 屏幕像素高度减去系统组件高度（只读）         |
| availLeft    | 没有被系统组件占用的屏幕的最左侧像素（只读） |
| availTop     | 没有被系统组件占用的屏幕的最顶端像素（只读） |
| availWidth   | 屏幕像素宽度减去系统组件宽度（只读）         |
| colorDepth   | 表示屏幕像素颜色的位数；多数系统是32（只读） |
| height       | 屏幕像素高度                                 |
| left         | 当前屏幕左边的像素距离                       |
| pixelDepth   | 屏幕的位深（只读）                           |
| top          | 当前屏幕顶端的像素距离                       |
| width        | 屏幕像素的宽度                               |
| orienatation | 返回Screen Orienation API 中屏幕的朝向       |



#### history 对象

```javascript
// 后退一页
history.go(-1);

// 前进一页
history.go(1);

// 前进两页
history.go(2);

// 导航到最近的wrox.com 页面
history.go("wrox.com")

// 导航到最近的nczonline.net 页面
history.go("nczonline.net");

// 后退一页
history.back();
// 前进一页
history.forword();

if (history.length == 1) {
    // 这是用户窗口的第一个页面
}

```

pushState 和 popState 的示范代码

```javascript
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>pushState</title>
</head>
<body style="width: 600px;">
     <h1>window.pushState示例</h1>
    <nav style="border: 1px solid;margin: 20px;">
        <a href="javascript:void (0);" id="h1">历史记录点1</a>
        <a href="javascript:;" id="h2">历史记录点2</a>
        <a href="javascript:;" id="h3">历史记录点3</a>
        <a href="javascript:;" id="h4">历史记录点4</a>
        <a href="javascript:;" id="h5">历史记录点5</a>
    </nav>
    <section style="border: 1px solid">
        <h2>正文内容</h2>
        <div id="content" style="height: 400px;overflow: hidden;font-size: 50px;text-align: center;"></div>
    </section>
</body>
      <script>
         var arr =  ['历史记录1','历史记录2','历史记录3','历史记录4','历史记录5'];
         var content = document.getElementById("content");
          function goTo(e){
              var target = e.target;
              var id = target.id;
              var text = target.innerHTML;
              var state = {};
              switch(id){
                  case "h1":
                      state = {currPage:"h1",title:"第一页"};
                      history.pushState(state,"","");  //添加记录点
                      content.innerHTML = arr[0];
                      break;
                  case "h2":
                      state = {currPage:"h2",title:"第二页"};
                      history.pushState(state,"","")
                      content.innerHTML = arr[1];
                      break;
                  case "h3":
                      state = {currPage:"h3",title:"第三页"};
                      history.pushState(state,"","")
                      content.innerHTML =arr[2];
                      break;
                  case "h4":
                      state = {currPage:"h4",title:"第四页"};
                      history.pushState(state,"","")
                      content.innerHTML = arr[3];
                      break;
                  case "h5":
                      state = {currPage:"h5",title:"第五页"};
                      history.pushState(state,"","")
                      content.innerHTML = arr[4];
                      break;
              }
          }
          function backOrForward(){ //前进或后退
              var currPage = window.history.state?window.history.state.currPage:"";
              switch(currPage){
                  case "h1":
                      content.innerHTML = arr[0];
                      break;
                  case "h2":
                      content.innerHTML = arr[1];
                      break;
                  case "h3":
                      content.innerHTML = arr[2];
                      break;
                  case "h4":
                      content.innerHTML = arr[3];
                      break;
                  case "h5":
                      content.innerHTML = arr[4];
                      break;
                  default :
                      content.innerHTML = "";
              }
          }
          document.addEventListener('click',goTo,false);      
          window.addEventListener('popstate',backOrForward,false);  //监听popstate事件
      </script>
</html>
```




