---
title: 论文题目
tags:
  - tag1
  - tag2
---

:::tip[资料卡]
 - 会议/期刊：
 - 其他信息1：
 - 其他信息2：
:::

## 1 一级标题
### 1.1 二级标题
#### （1）三级标题

正文。

## 2 格式规范
### 2.1 正文
正文段落间需要空一行，否则将视为同一段落。

务必注意：

1. 若要加粗文字，请采用<strong>加粗文字</strong>，**加粗文字**会在一些情况下失效。
2. 换行标签`<br>`需要写成自闭合形式`<br />`。

### 2.2 图
引用图时，可如此表达：如[图2-1](#figure2-1)所示。括号中的内容是图id。格式如下：
<figure id="figure2-1">
  <img src="./2-1图链接.png"/>
  <figcaption>图2-1 图题</figcaption>
</figure>

:::info[图编号的含义]
记图编号为图$x-y$，其中：
$x$——一级标题编号；
$y$——图序号（即第几幅图。计数自1起，并在跨越章后重置）。
:::

若图含子图，可如此表达：如[图2-2](#figure2-2)、[图2-2(a)](#figure2-2a)、[图2-2(b)](#figure2-2b)所示。图格式如下：

<figure id="figure2-2">
  <figure id="figure2-2a">
    <img src="./2-2(a)图名.png"/>
    <figcaption>图2-2(a) 子图</figcaption>
  </figure>

  <figure id="figure2-2b">
    <img src="./2-2(b)图名.png"/>
    <figcaption>图2-2(b) 子图</figcaption>
  </figure>

  <figcaption>图2-2 含子图的图</figcaption>
</figure>

### 2.3 表
引用表时，可如此表达：如[表2-1](#table2-1)所示。括号中的内容是表id。表格式如下：

<table id="table2-1">
  <caption>表2-1 表题</caption>
  <thead>
    <tr><th>表头第一列</th><th>表头第二列</th></tr>
  </thead>
  <tbody>
    <tr><td>表身第一行第一列内容</td><td>表身第一行第二列内容</td></tr>
    <tr><td>表身第二行第一列内容</td><td>表身第二行第二列内容</td></tr>
  </tbody>
</table>

表编号的含义与图相仿。

务必注意：`<tr>`和`</tr>`标签之间不允许换行。

### 2.4 公式
公式使用示例：设$R_a$是由于环境光照产生的结果强度曲线，$L_c$是环境光的强度曲线，$O_a$是物体的颜色曲线，则环境光照公式为：

$$
R_a = L_c \cdot O_a
$$ 

### 2.5 其他
未尽事宜，可前往Docusaurus官网查阅资料，或在搜索引擎中查找有关markdown的语法。

## 3 内容要素
笔记内容须参考下述要素撰写：
 - 解决何问题
 - 大致采取何方法
 - 优势与不足
 - 创新点[Optional]
 - 个人感悟