---
title: Docker
categories:
  - JavaWeb
abbrlink: f5f9fa9b
date: 2025-07-02 15:11:52
tags:
---

<meta name = "referrer", content = "no-referrer"/>

## 一、简介

<img src="https://cos.easydoc.net/46901064/files/kv7rlicu.png" style="zoom:80%;" />

### 什么是Docker

Docker 是一个开源的<u>应用容器引擎</u>，基于 **Go** **语言** 并遵从Apache2.0协议开源。

**Docker** **可以让开发者打包他们的应用以及依赖包到一个轻量级、可移植的容器中，然后发布到任何流行的** **Linux机器上，也可以实现虚拟化。**

容器是完全使用沙箱机制，相互之间不会有任何接口，更重要的是容器性能开销极低

### 为什么用Docker

**1、 简化程序**

Docker 让开发者可以打包他们的应用以及依赖包到一个可移植的容器中，然后发布到任何流行的 Linux 机器上，便可以实现虚拟化。Docker改变了虚拟化的方式，使开发者可以直接将自己的成果放入Docker中进行管理。

**2、 快速部署** 

Docker 镜像中包含了运行环境和配置，所以 Docker 可以简化部署多种应用实例工作。比如 Web 应用、后台应用、数据库应用、大数据应用比如 Hadoop 集群、消息队列等等都可以打包成一个镜像部署。

**3、 节省开支** 

一方面，云计算时代到来，使开发者不必为了追求效果而配置高额的硬件，Docker 改变了高性能必然高价格的思维定势。Docker 与云的结合，让云空间得到更充分的利用。不仅解决了硬件管理的问题，也改变了虚拟化的方式。

**4、 持续交付和部署**

对开发和运维（DevOps）人员来说，最希望的就是一次创建或配置，可以在任意地方正常运行。使用 Docker 可以通过定制应用镜像来实现持续集成、持续交付、部署。开发人员可以通过 Dockerfile 来进行镜像构建，并结合 持续集成(Continuous Integration) 系统进行集成测试，而运维人员则可以直接在生产环境中快速部署该镜像，甚至结合 持续部署(Continuous Delivery/Deployment) 系统进行自动部署。而且使用 Dockerfile 使镜像构建透明化，不仅仅开发团队可以理解应用运行环境，也方便运维团队理解应用运行所需条件，帮助更好的生产环境中部署该镜像

**5、 更轻松的迁移**

由于 Docker 确保了执行环境的一致性，使得应用的迁移更加容易。Docker 可以在很多平台上运行，无论是物理机、虚拟机、公有云、私有云，甚至是笔记本，其运行结果是一致的。因此用户可以很轻易的将在一个平台上运行的应用，迁移到另一个平台上，而不用担心运行环境的变化导致应用无法正常运行的情况



### Docker的应用场景

- Web 应用的自动化打包和发布。
- 自动化测试和持续集成、发布。
- 在服务型环境中部署和调整数据库或其他的后台应用。

### Docker和虚拟机对比

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250702160442687-2025-7-216:04:52.png" style="zoom:80%;" />

Docker 和虚拟机（VM）是两种不同的虚拟化技术，它们在架构、性能和使用场景上有显著差异。

- 实现技术原理不同：虚拟机是⽤来进⾏硬件资源划分的完美解决⽅案，利⽤的是**硬件虚拟化技术**。而容器则是**操作系统级别的虚拟化**，利⽤的是内核的 Cgroup （资源限制）和 Namespace 特性，此功能通过软件来实现，仅仅是进程本身就可以实现互相隔离，不需要任何辅助。
- 使用资源方面不同： **Docker 容器与主机共享操作系统内核**，不同的容器之间可以共享部分系统资源，因此更加轻量级， 消耗的资源更少。 **虚拟机会独占分配给⾃⼰的资源**，不存在资源共享，各个虚拟机之间近乎完全隔离，更加重量级，也 会消耗更多的资源。
- 应用场景不同：若需要资源的完全隔离并且不考虑资源的消耗，可以使用虚拟机。 若是想隔离进程并且需要运行大量进程实例，应该选择 Docker 容器。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250702161202518-2025-7-216:12:03.png" style="zoom:80%;" />

### 总结

- Docker使用Google公司推出的Go语言进行开发实现，基于Linux内核的cgroup，namespace，以及AUFS类的UnionFS等技术，对**进程**进行封装隔离，属于操作系统层面的虚拟化技术。由于隔离的进程独立于宿主和其它的隔离的进程，因此也称其为容器。Docke最初实现是基于LXC。

- Docker能够自动执行重复性任务，例如搭建和配置开发环境，从而解放了开发人员以便他们专注在真正重要的事情上：**构建杰出的软件**。

- 用户可以方便地**创建和使用容器**，把自己的应用放入容器。容器还可以进行版本管理、复制、分享、修改，就像管理普通的代码一样。

- Docker的镜像提供了除内核外完整的运行时环境，确保了应用运行环境一致性，从而不会再出现“这段代码在我机器上没问题啊”这类问题；——**一致的运行环境**

- 可以做到秒级、甚至毫秒级的启动时间。大大的节约了开发、测试、部署的时间。更快速的启动时间避免公用的服务器，资源会容易受到其他用户的影响。——**隔离性**

- 善于处理集中爆发的服务器使用压力；——**弹性伸缩，快速扩展**

- 可以很轻易的将在一个平台上运行的应用，迁移到另一个平台上，而不用担心运行环境的变化导致应用无法正常运行的情况。——**迁移方便**

- 使用Docker可以通过定制应用镜像来实现持续集成、持续交付、部署。——**持续交付和部署**

## 二、Docker基础

### Docker架构

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250702162453088-2025-7-216:24:54.png" style="zoom:80%;" />

Docker 使用客户端-服务器 (C/S) 架构模式，使用远程API来管理和创建Docker容器。

### Docker 的基本概念

Docker包括三个基本概念，它们构成了 Docker 技术栈的基础：

- **镜像**（ Image ）

- **容器**（ Container ）

- **仓库**（ Repository ）

#### 镜像

Docker 镜像是一个特殊的文件系统，除了提供容器运行时所需的程序、库、资源、配置等文件外，还包含了一些为运行时准备的一些配置参数（如匿名卷、环境变量、用户等）。镜像不包含任何动态数据，其内容在构建之后也不会被改变。

镜像是一个**只读**的模板，镜像构建后无法修改，只能通过重新构建生成新版本。

***

**分层存储**

因为镜像包含操作系统完整的 root 文件系统，其体积往往是庞大的，因此在 Docker 设计时，就充分利用 **UnionFS** 的技术，将其设计为分层存储的架构。所以严格来说，镜像并非是像一个 ISO 那样的打包文件，镜像只是一个虚拟的概念，其实际体现并非由一个文件组成，而是由一组文件系统组成，或者说，由多层文件系统联合组成。

镜像构建时，会一层层构建，前一层是后一层的基础。每一层构建完就不会再发生改变，后一层上的任何改变只发生在自己这一层。比如，删除前一层文件的操作，实际不是真的删除前一层的文件，而是仅在当前层标记为该文件已删除。在最终容器运行的时候，虽然不会看到这个文件，但是实际上该文件会一直跟随镜像。因此，在构建镜像的时候，需要额外小心，每一层尽量只包含该层需要添加的东西，任何额外的东西应该在该层构建结束前清理掉。

分层存储的特征还使得镜像的复用、定制变的更为容易。甚至可以用之前构建好的镜像作为基础层，然后进一步添加新的层，以定制自己所需的内容，构建新的镜像

#### 容器

容器通过镜像来创建，镜像和容器的关系，就像是面向对象程序设计中的 类 和 实例 一样。镜**像是静态的定义，容器是镜像运行时的实体**。容器可以被创建、启动、停止、删除、暂停等。

容器的实质是**进程**，但与直接在宿主执行的进程不同，容器进程运行于属于自己的独立的 **命名空间**。因此容器可以拥有自己的 root 文件系统、自己的网络配置、自己的进程空间，甚至自己的用户 ID 空间。容器内的进程是运行在一个隔离的环境里，使用起来，就好像是在一个独立于宿主的系统下操作一样。这种特性使得容器封装的应用比直接在宿主运行更加安全。

每一个容器运行时，会在镜像的只读层之上创建一个可写层，所有对容器的修改（如文件写入、配置变更）都发生在此层，可以称这个为容器运行时读写而准备的存储层为**容器存储层**。该层与容器生命周期绑定，容器删除时，容器存储层也随之消亡。因此，任何保存于容器存储层的信息都会随容器删除而丢失。

按照 Docker 最佳实践的要求，容器不应该向其存储层内写入任何数据，容器存储层要保持无状态化。所有的文件写入操作，都应该使用 **数据卷（Volume**） 、或者**绑定宿主目录**，在这些位置的读写会跳过容器存储层，直接对宿主（或网络存储）发生读写，其性能和稳定性更高。

数据卷是由 Docker 管理的持久化存储，独立于容器生命周期。容器消亡，数据卷不会消亡。因此，使用数据卷后，容器删除或者重新运行之后，数据却不会丢失。

#### 仓库

Docker仓库是集中存储和分发**镜像**的服务，分为 公共仓库（如 Docker Hub）和 私有仓库（如 Harbor）。

***

**公有** **Docker Registry**

Docker Registry 公开服务是开放给用户使用、允许用户管理镜像的 Registry 服务。一般这类公开服务允许用户免费上传、下载公开的镜像，并可能提供收费服务供用户管理私有镜像。

最常使用的 Registry 公开服务是官方的 [Docker Hub](https://hub.docker.com/)，这也是默认的 Registry，并拥有大量的高质量的官方镜像。

由于某些原因，在国内访问这些服务可能会比较慢。国内的一些云服务商提供了针对 Docker Hub 的镜像服务（ Registry Mirror ），这些镜像服务被称为**加速器**。常见的有 **阿里云加速器**、**DaoCloud** **加速器** 等。

***

**私有** **Docker Registry**

除了使用公开服务外，用户还可以在本地搭建私有 Docker Registry。Docker 官方提供了 **Docker Registry** 镜像，可以直接使用做为私有 Registry 服务。

开源的 Docker Registry 镜像只提供了 **Docker Registry API** 的服务端实现，足以支持 docker 命令，不影响使用。但不包含图形界面，以及镜像维护、用户管理、访问控制等高级功能。在官方的商业化版本 **Docker Trusted Registry**中，提供了这些高级功能。

除了官方的 Docker Registry 外，还有第三方软件实现了 Docker Registry API，甚至提供了用户界面以及一些高级功能。比如，**VMWare Harbor** 和 **Sonatype Nexus**。

### Docker安装与配置

目前，CentOS 仅发行版本中的内核支持 Docker。Docker 运行在 CentOS 7 上，要求系统为64位、系统内核版本为 3.10以上。Docker 运行在 CentOS-6.5 或更高的版本的 CentOS 上，要求系统为64位、系统内核版本为 2.6.32-431 或者更高版本。

从 2017 年 3 月开始 docker 在原来的基础上分为两个分支版本: Docker CE 和 Docker EE。

Docker CE 即社区免费版，Docker EE 即企业版，强调安全，但需付费使用。此处介绍 Docker CE 的安装使用。

1. 校验版本

   命令：`uname -r` 校验Linux内核版本（3.10以上版本）

2. 移除旧版本

   ```bash
   sudo yum remove docker \
   				docker-client \
   				docker-client-latest \
   				docker-common \
   				docker-latest \
   				docker-latest-logrotate \
   				docker-logrotate \
   				docker-selinux \
   				docker-engine-selinux \
   				docker-engine
   ```

3. 安装一些必要的系统工具

   ```bash
   sudo yum install -y yum-utils device-mapper-persistent-data lvm2
   ```

4. 添加软件源信息

   源1：官方推荐

   ```bash
   yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
   ```

   源2：阿里云源

   ```bash
   sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
   ```

5. 更新yum缓存

   ```bash
   sudo yum makecache
   ```

6. 安装Docker-CE

   ```bash
   sudo yum -y install docker-ce
   ```

7. 启动Docker后台服务

   ```bash
   sudo systemctl start docker
   ```

8. 查看Docker版本验证是否安装成功

   ```bash
   docker version
   ```

***

执行以下命令来卸载Docker-CE

```bash
sudo yum remove docker-ce
sudo rm -rf /var/lib/docker
```

***

Docker镜像加速器配置

鉴于国内网络问题，后续拉取 Docker 镜像十分缓慢，我们可以需要配置加速器来解决

阿里云为每个用户都配备了一个加速器地址，登录账号->容器镜像服务->容器镜像工具->镜像加速器。

通过在 /etc/docker/daemon.json 中写入如下内容（如果文件不存在请新建该文件）

```json
{

"registry-mirrors":["加速器地址"]

}
```

{% spoiler "其他镜像"%}

```json
{
    "registry-mirrors": [
                "https://docker.1panelproxy.com",
                "https://dockerproxy.1panel.live",
                "https://docker.1panel.live",
                "https://proxy.1panel.live",
                  "https://docker.m.daocloud.io",
    "https://noohub.ru",
    "https://huecker.io",
    "https://dockerhub.timeweb.cloud",
    "https://0c105db5188026850f80c001def654a0.mirror.swr.myhuaweicloud.com",
    "https://5tqw56kt.mirror.aliyuncs.com",
    "https://docker.1panel.live",
    "http://mirrors.ustc.edu.cn/",
    "http://mirror.azure.cn/",
    "https://hub.rat.dev/",
    "https://docker.ckyl.me/",
    "https://docker.chenby.cn",
    "https://docker.hpcloud.cloud",
    "https://docker.m.daocloud.io"
        ]
}
```



{% endspoiler%}

重启Docker

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

执行 `docker info`命令查看配置是否生效

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250702172922731-2025-7-217:29:24.png" style="zoom:80%;" />

### Docker镜像操作

镜像是Docker的三大组件之一。

Docker运行容器前需要本地存在对应的镜像，如果本地不存，Docker会从镜像仓库下载。

**本节将介绍更多关于镜像的内容，包括：**

- 从仓库获取镜像；

- 管理本地主机上的镜像；

- 介绍镜像实现的基本原理;

#### 获取镜像

Docker Hub 上有大量的高质量的镜像可以用，可以从 [Docker Hub 网站](https://hub.docker.com/)来搜索镜像。

也可以使用 `docker search` 命令来搜索镜像。比如需要一个tomcat的镜像来作为我们的web服务

```bash
docker search tomcat
```

***

从 Docker 镜像仓库获取镜像的命令是 `docker pull` 其命令格式为：

```bash
docker pull [选项] [Docker Registey 地址[:端口号]/] 仓库名[:标签]
```

- 具体的选项可以通过 `docker pull --help` 命令看到
- Docker 镜像仓库地址的格式一般是 `<域名/IP>[:端口号]`。默认地址是 Docker Hub，但由于之前配置了阿里云的地址，所以会从阿里云镜像仓库中下载。
- 仓库名：这里的仓库名是两段式名称， 即 <用户名>/<软件名>。对于 Docker Hub，如果不给出用户名，则默认为 library，也就是官方镜像。
- 标签用于指明镜像的版本，省略时默认为latest版本。



以拉取tomcat 8的镜像为例

```bash
docker pull tomcat:8
```

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250702175019043-2025-7-217:50:25.png)

{% note info%}

如上图所示。从下载过程中可以看到我们之前提及的分层存储的概念，镜像是由多层存储所构成。下载也是一层层的去下载，并非单一文件。下载过程中给出了每一层的 ID 的前 12 位。并且下载结束后，给出该镜像完整的 sha256 的摘要，以确保下载一致性。

{% endnote%}



#### 列出镜像

要想列出已经下载下来的镜像，可以使用 `docker images` 命令。

```bash
docker images #返回镜像列表
```

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250702175442327-2025-7-217:54:43.png)

列表包含了 **仓库名、标签、镜像ID、创建时间 以及 所占用的空间**。 其中**镜像ID是镜像的唯一标识**，一个镜像可以对应多个标签。因此，如果拥有相同的 ID，因为它们对应的是同一个镜像。

{% note info%}

关于镜像体积：

列表中的镜像体积总和并非是所有镜像实际硬盘消耗。由于 Docker 镜像是多层存储结构，并且可以继承、复用，因此不同镜像可能会因为使用相同的基础镜像，从而拥有共同的层。由于 Docker 使用 Union FS，相同的层只需要保存一份即可，因此实际镜像硬盘占用空间很可能要比这个列表镜像大小的总和要小的多。

比如，此时再次拉取tomcat的最新版本镜像，它会复用之前镜像中的一些层

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250702180123423-2025-7-218:02:41.png" style="zoom:80%;" />

{% endnote%}

#### 删除本地镜像

```bash
docker rmi 镜像ID
```

> 要删除镜像必须确认此镜像⽬前没有被任何容器使⽤

补充：虚悬镜像

虚悬镜像是 Docker 中一种特殊的镜像状态，通常指 **没有标签（Tag）且未被任何容器引用的中间层镜像**。

当镜像的 `<TAG>` 被覆盖或删除后，旧版本的镜像会变成 **`<none>:<none>`** 状态，称为虚悬镜像。虚悬镜像本质是磁盘垃圾，通常可安全清理。

```bash
REPOSITORY    TAG       IMAGE ID       CREATED         SIZE
<none>        <none>    123abc456def   2 weeks ago     1.2GB  # 虚悬镜像示例
```

可能产生的原因：

- 构建新镜像时覆盖了旧标签。新旧镜像同名，旧镜像名称被取消，从而出现仓库名、标签均为none的镜像。比如：`docker build -t my-image:latest` 重复执行
- 删除镜像标签

```bash
# 列出所有虚悬镜像
docker images -f "dangling=true"

# 删除所有虚悬镜像
docker image prune
```



#### 导入导出镜像

备份本地仓库的镜像

1. **⽤** **save** **⼦命令将本地仓库的镜像保存当前⽬录下**

   ```bash
   docker save -o xxxx.tar 镜像名称
   ```

2. **将本地目录下的镜像备份文件导⼊到本地** **Docker** **仓库**

   ```bash
   # ⽅式—(不输出详细信息）：
   docker load –i xxxx.tar
   # ⽅式⼆（输出详细信息）：
   docker load < xxxx.tar
   ```

要将自己的镜像共享给团队其他成员，更常用的方式是：会先Docker私库，将自己的上传，其他成员使用docker pull 的方式拉取。

### Docker容器操作

容器是独立运行的一个或一组应用，以及它们的运行环境。

#### 查看容器状态

```bash
docker ps #查看*运行*的容器
docker ps –a #查看所有的容器（包含运行和退出）
docker inspect 容器ID  #查看容器内部详情，如挂载、网络设置等
```



#### 启动容器

启动容器有二种方式，一种是基于镜像新建一个容器并启动，一种是将在终止状态（ stopped ）的容器重新启动

```bash
#基于镜像启动
docker run 参数 镜像名称:tage 

#启动停止状态的容器
docker start 容器名称/容器ID

#重启容器
docker restart 容器名称/容器ID
```

常用基础参数

- -it : 交互式运行
- -d: 后台运行
- --name: 指定容器名称
- --rm: 容器退出后销毁
- -p: 宿主机：内部端口

例：在后台运行一个tomcat容器，容器名称是tomcat-8081，并且将主机的 8081 端口 映射到容器的 8080 端口。容器启动后，Tomcat 服务会在容器内部的 8080 端口运行，可以通过主机的 8081 端口即可访问。

```bash
docker run -d -name tomcat-8081 -p 8081:8080 tomcat:8
```



默认情况下，每次重启虚拟机我们都需要⼿动启动Docker和Docker中的容器。通过命令可以实现开机⾃启：

```bash
# Docker开机⾃启
systemctl enable docker

# Docker容器开机⾃启
docker update --restart=always [容器名/容器id]
```

#### 停止容器

```bash
#停止运行的容器
docker stop 容器名称/容器ID

#停止所有的容器
docker stop $(docker ps -a -q)
```

#### 删除容器

处于运行状态的容器无法直接删除，需要先将其停止后再删

```bash
#删除指定容器
docker rm 容器名称/容器ID

#删除所有容器
docker rm $(docker ps -a -q)
```

#### 进入容器内部

某些时候需要进入容器进行操作，使用 `docker exec` 命令。比如，进入mysql容器内部进行sql操作。

```bash
docker exec [OPTIONS] CONTAINER COMMAND [ARG...]
```

- [OPTIONS] ：配置执行方式的参数，核心参数有：
  - -i：保持标准输入打开，允许交互式输入
  - -t：分配伪终端，**通常与 -i 联用 (`-it`)**
  - -d：在后台执行命令
  - -u：以指定的用户身份执行
  - -e：设置环境变量（临时生效）
  - -w：指定命令的工作目录
- CONTAINER：<u>已运行的容器</u>的名称或ID
- COMMAND：要在容器内执行的命令，如 /bin/bash、ls、mysql、shell等
- [ARG...]：传递给命令的参数

例1：进入mysql内部进行sql查询

```bash
docker exec -it mysql mysql -uroot -p

#或者
docker exec -it mysql bash
mysql -uroot -p
```

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250703100606136-2025-7-310:06:19.png" style="zoom:80%;" />

例2：进入tomcat容器内部，添加index.html

```bash
docker exec -it tomcat-8081 bash
```

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250703101328143-2025-7-310:13:28.png" style="zoom:80%;" />

#### 在宿主机和容器之间交换文件

在宿主机和容器之间相互COPY⽂件 cp的⽤法如下

```bash
docker cp [OPTIONS] CONTAINER:SRC_PATH DEST_PATH  # 容器 → 本地
docker cp [OPTIONS] SRC_PATH CONTAINER:DEST_PATH  # 本地 → 容器
```

- CONTAINER	容器名称或 ID（如 my-container 或 abc123）
- SRC_PATH	源文件/目录路径（容器内或本地）
- DEST_PATH	目标路径（容器内或本地）

### Docker查看日志

```bash
docker logs [OPTIONS] 容器名称/ID
```

核心参数：

- `-f` : 实时跟踪日志输出
- `--tail N` : 仅显示最后N行，默认显示全部
- `-t`：显示日志的时间戳
- `--since time`：显示指定时间之后的日志，如2024-05-06或10m
- `--until time`：显示指定时间之前的日志
- `-n`：显示日志的额外元数据

### Docker数据卷

问题：通过镜像创建一个容器。容器一旦被销毁，则容器内的数据将一并被删除。容器中的数据不是持久化状态的。那有没有一种独立于容器、提供持久化并能服务于多个容器的东西呢？有的兄弟，有的---数据卷。

***

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250703105403083-2025-7-310:54:04.png" style="zoom:80%;" />

什么是数据卷？

数据卷是一个可供一个或多个容器使用的特殊目录。它是 Docker 中用于持久化存储和共享数据的核心机制，它独立于容器的生命周期，即使容器被删除，数据卷仍然存在。

特性：

- 数据卷可以在容器之间共享和重用
- 对数据卷的修改会立马生效
- 对数据卷的更新，不会影响镜像
- 数据卷默认会一直存在，即使容器被删除

***

为什么需要数据卷？

这得从 docker 容器的文件系统说起。出于效率等一系列原因，docker 容器的文件系统在宿主机上存在的方式很复杂，这会带来下面几个问题：

- 不能在宿主机上很方便地访问容器中的文件。

- 无法在多个容器之间共享数据。

- 当容器删除时，容器中产生的数据将丢失

为了解决这些问题，docker 引入了数据卷(volume) 机制。**数据卷是存在于一个或多个容器中的特定文件或文件夹，这个文件或文件夹以独立于 docker 文件系统的形式存在于宿主机中，将docker容器内的数据保存进宿主机的磁盘中。**

数据卷的最大特点是：其生存周期**独立于容器的生存周期**。



***

使用数据卷的最佳场景

- 在多个容器之间共享数据，多个容器可以同时以只读或者读写的方式挂载同一个数据卷，从而共享数据卷中的数据。

- 当宿主机不能保证一定存在某个目录或一些固定路径的文件时，使用数据卷可以规避这种限制带来的问题。

- 当你想把容器中的数据存储在宿主机之外的地方时，比如远程主机上或云存储上。

- 当你需要把容器数据在不同的宿主机之间备份、恢复或迁移时，数据卷是很好的选择。



#### 数据卷类型

{% note warning%}

Docker挂载主机目录访问如果出现cannot open directory.：Permission denied
解决办法：在挂载目录后多加一个`--privileged=true`参数即可。扩大容器的权限解决挂载目录没有权限的问题，使container内的root拥有真正的root权限

{% endnote%}

**命名卷**：由Docker管理的持久化存储，默认存储在 `/var/lib/docker/volumes/` 目录下，由 Docker 自动维护生命周期。

特点：

- 容器删除后数据仍然保留
- 适合跨主机迁移（通过 `docker volume` 命令管理）
- Docker 对存储驱动进行了性能优化
- 自动继承容器内目标路径的权限

适用场景：

- 数据库存储（MySQL、PostgreSQL等）
- 需要 Docker 管理生命周期的持久化数据
- 跨容器共享数据

```bash
# 创建命名卷
docker volume create myapp_data

# 使用命名卷启动容器
docker run -d -v myapp_data:/var/lib/mysql mysql:8.0

# 查看卷详情
docker volume inspect myapp_data

# 删除卷（需先移除所有引用）
docker volume rm myapp_data

```

***

**绑定挂载**：**直接映射主机文件系统路径**到容器，完全绕过 Docker 的存储管理。

```bash
docker run -d --privileged=true -v 宿主机绝对路径目录：容器内目录 镜像名
```



特点：

- 主机和容器文件实时双向同步
- 可使用任意主机目录
- 直接读写主机文件系统，性能最佳
- 路径必须存在，且与主机环境耦合度高

适用场景：开发环境，代码热更新；使用主机特定配置文件；需要直接访问主机设备的场景

```bash
# 映射主机目录到容器
docker run -d -v /host/path:/container/path nginx

# 只读模式挂载（容器不能修改）；默认是权限rw，可读写
docker run -d -v /host/config:/etc/nginx:ro nginx

# 数据卷继承。容器2继承容器1的卷规则 --volumes-from
docker run -d --privileged=true --volumes-from 父类  --name 容器名 镜像
```



***

**共享存储卷**：支持第三方存储系统，如 NFS、AWS EBS、Ceph 等。

常见驱动类型：

| 驱动类型     | 描述                            | 典型用例         |
| ------------ | ------------------------------- | ---------------- |
| `local`      | 默认本地存储（命名卷/绑定挂载） | 单机部署         |
| `nfs`        | 挂载网络文件系统                | 跨主机共享数据   |
| `sshfs`      | 通过 SSH 挂载远程目录           | 安全访问远程文件 |
| `azure_file` | Azure 云存储                    | 云环境持久化     |

```bash
# 创建NFS卷
docker volume create --driver local \
  --opt type=nfs \
  --opt o=addr=192.168.1.100,rw \
  --opt device=:/path/on/nfs \
  nfs_volume

# 使用云存储卷（AWS EBS示例）
docker run -v ebs_volume:/data amazon/amazon-ecs-agent
```

### Docker网络



## 三、镜像制作 Dockerfile

当我们从docker镜像仓库中下载的镜像不能满足我们的需求时，我们可以通过以下两种方式对镜像进行更改：

1. 从已经创建的容器中更新镜像，并且提交这个镜像 
2. 使用 Dockerfile 指令来创建一个新的镜像

镜像的定制实际上就是定制每一层所添加的配置、文件。**如果我们可以把每一层修改、安装、构建、操作的命令都写入一个脚本，用这个脚本来构建、定制镜像**，那么之前提及的无法重复的问题、镜像构建透明性的问题、体积的问题就都会解决。这个脚本就是 Dockerfile。

Dockerfile 是一个文本文件，其内包含了一条条的指令，每条指令都会创建一个新的镜像层并对镜像进行提交，因此每一条指令的内容，就是描述该层应当如何构建。



从应用软件的角度来看，Dockerfile、Docker镜像与Docker容器分别代表软件的三个不同阶段：

- Dockerfile是软件的原材料
- Docker镜像是软件的交付品
- Docker容器则可以认为是软件镜像的运行态，也即依照镜像运行的容器实例

Dockerfile面向开发，Docker镜像成为交付标准，Docker容器则涉及部署与运维，三者缺一不可。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250706102348480-2025-7-610:23:59.png" style="zoom:80%;" />

***

**补充**：`docker commit` ：用于将正在运行的容器保存为新的镜像。主要用于临时保存调试状态和紧急备份，生产环境通常要求通过 Dockerfile 构建标准化镜像。

```bash
docker commit -m=“提交的描述信息” -a="作者信息" 容器ID  新镜像名:标签
```





### 常用命令

首先参考一下tomcat的Dockerfile文件

{% spoiler "Dockerfile"%}

```dockerfile
#
# NOTE: THIS DOCKERFILE IS GENERATED VIA "apply-templates.sh"
#
# PLEASE DO NOT EDIT IT DIRECTLY.
#

FROM eclipse-temurin:21-jdk-noble

ENV CATALINA_HOME /usr/local/tomcat
ENV PATH $CATALINA_HOME/bin:$PATH
RUN mkdir -p "$CATALINA_HOME"
WORKDIR $CATALINA_HOME

# let "Tomcat Native" live somewhere isolated
ENV TOMCAT_NATIVE_LIBDIR $CATALINA_HOME/native-jni-lib
ENV LD_LIBRARY_PATH ${LD_LIBRARY_PATH:+$LD_LIBRARY_PATH:}$TOMCAT_NATIVE_LIBDIR

ENV TOMCAT_MAJOR 11
ENV TOMCAT_VERSION 11.0.8
ENV TOMCAT_SHA512 82a7a2e686da1fbafdd76c863d0bd1435bcd7e58d507ad353c43e364522eb3284d2dc3552388a5ca389e48afed863885886572edc13ba40ff0a13e339fca251f

RUN set -eux; \
	\
	savedAptMark="$(apt-mark showmanual)"; \
	apt-get update; \
	apt-get install -y --no-install-recommends \
		ca-certificates \
		curl \
		gnupg \
	; \
	\
	ddist() { \
		local f="$1"; shift; \
		local distFile="$1"; shift; \
		local mvnFile="${1:-}"; \
		local success=; \
		local distUrl=; \
		for distUrl in \
# https://apache.org/history/mirror-history.html
			"https://dlcdn.apache.org/$distFile" \
# if the version is outdated, we have to pull from the archive
			"https://archive.apache.org/dist/$distFile" \
# if all else fails, let's try Maven (https://www.mail-archive.com/users@tomcat.apache.org/msg134940.html; https://mvnrepository.com/artifact/org.apache.tomcat/tomcat; https://repo1.maven.org/maven2/org/apache/tomcat/tomcat/)
			${mvnFile:+"https://repo1.maven.org/maven2/org/apache/tomcat/tomcat/$mvnFile"} \
		; do \
			if curl -fL -o "$f" "$distUrl" && [ -s "$f" ]; then \
				success=1; \
				break; \
			fi; \
		done; \
		[ -n "$success" ]; \
	}; \
	\
	ddist 'tomcat.tar.gz' "tomcat/tomcat-$TOMCAT_MAJOR/v$TOMCAT_VERSION/bin/apache-tomcat-$TOMCAT_VERSION.tar.gz" "$TOMCAT_VERSION/tomcat-$TOMCAT_VERSION.tar.gz"; \
	echo "$TOMCAT_SHA512 *tomcat.tar.gz" | sha512sum --strict --check -; \
	ddist 'tomcat.tar.gz.asc' "tomcat/tomcat-$TOMCAT_MAJOR/v$TOMCAT_VERSION/bin/apache-tomcat-$TOMCAT_VERSION.tar.gz.asc" "$TOMCAT_VERSION/tomcat-$TOMCAT_VERSION.tar.gz.asc"; \
	GNUPGHOME="$(mktemp -d)"; export GNUPGHOME; \
	curl -fL -o upstream-KEYS 'https://www.apache.org/dist/tomcat/tomcat-11/KEYS'; \
	gpg --batch --import upstream-KEYS; \
# filter upstream KEYS file to *just* known/precomputed fingerprints
	printf '' > filtered-KEYS; \
# see https://www.apache.org/dist/tomcat/tomcat-11/KEYS
	for key in \
		'A9C5DF4D22E99998D9875A5110C01C5A2F6059E7' \
		'48F8E69F6390C9F25CFEDCD268248959359E722B' \
	; do \
		gpg --batch --fingerprint "$key"; \
		gpg --batch --export --armor "$key" >> filtered-KEYS; \
	done; \
	gpgconf --kill all; \
	rm -rf "$GNUPGHOME"; \
	GNUPGHOME="$(mktemp -d)"; export GNUPGHOME; \
	gpg --batch --import filtered-KEYS; \
	gpg --batch --verify tomcat.tar.gz.asc tomcat.tar.gz; \
	tar -xf tomcat.tar.gz --strip-components=1; \
	rm bin/*.bat; \
	rm tomcat.tar.gz*; \
	gpgconf --kill all; \
	rm -rf "$GNUPGHOME"; \
	\
# https://tomcat.apache.org/tomcat-9.0-doc/security-howto.html#Default_web_applications
	mv webapps webapps.dist; \
	mkdir webapps; \
# we don't delete them completely because they're frankly a pain to get back for users who do want them, and they're generally tiny (~7MB)
	\
	nativeBuildDir="$(mktemp -d)"; \
	tar -xf bin/tomcat-native.tar.gz -C "$nativeBuildDir" --strip-components=1; \
	apt-get install -y --no-install-recommends \
		dpkg-dev \
		gcc \
		libapr1-dev \
		libssl-dev \
		make \
	; \
	( \
		export CATALINA_HOME="$PWD"; \
		cd "$nativeBuildDir/native"; \
		gnuArch="$(dpkg-architecture --query DEB_BUILD_GNU_TYPE)"; \
		aprConfig="$(command -v apr-1-config)"; \
		./configure \
			--build="$gnuArch" \
			--libdir="$TOMCAT_NATIVE_LIBDIR" \
			--prefix="$CATALINA_HOME" \
			--with-apr="$aprConfig" \
			--with-java-home="$JAVA_HOME" \
		; \
		nproc="$(nproc)"; \
		make -j "$nproc"; \
		make install; \
	); \
	rm -rf "$nativeBuildDir"; \
	rm bin/tomcat-native.tar.gz; \
	\
# reset apt-mark's "manual" list so that "purge --auto-remove" will remove all build dependencies
	apt-mark auto '.*' > /dev/null; \
	[ -z "$savedAptMark" ] || apt-mark manual $savedAptMark > /dev/null; \
	find "$TOMCAT_NATIVE_LIBDIR" -type f -executable -exec ldd '{}' ';' \
		| awk '/=>/ { print $(NF-1) }' \
		| xargs -rt readlink -e \
		| sort -u \
		| xargs -rt dpkg-query --search \
		| cut -d: -f1 \
		| sort -u \
		| tee "$TOMCAT_NATIVE_LIBDIR/.dependencies.txt" \
		| xargs -r apt-mark manual \
	; \
	\
	apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false; \
	rm -rf /var/lib/apt/lists/*; \
	\
# sh removes env vars it doesn't support (ones with periods)
# https://github.com/docker-library/tomcat/issues/77
	find ./bin/ -name '*.sh' -exec sed -ri 's|^#!/bin/sh$|#!/usr/bin/env bash|' '{}' +; \
	\
# fix permissions (especially for running as non-root)
# https://github.com/docker-library/tomcat/issues/35
	chmod -R +rX .; \
	chmod 1777 logs temp work; \
	\
# smoke test
	catalina.sh version

# verify Tomcat Native is working properly
RUN set -eux; \
	nativeLines="$(catalina.sh configtest 2>&1)"; \
	nativeLines="$(echo "$nativeLines" | grep 'Apache Tomcat Native')"; \
	nativeLines="$(echo "$nativeLines" | sort -u)"; \
	if ! echo "$nativeLines" | grep -E 'INFO: Loaded( APR based)? Apache Tomcat Native library' >&2; then \
		echo >&2 "$nativeLines"; \
		exit 1; \
	fi

EXPOSE 8080

# upstream eclipse-temurin-provided entrypoint script caused https://github.com/docker-library/tomcat/issues/77 to come back as https://github.com/docker-library/tomcat/issues/302; use "/entrypoint.sh" at your own risk
ENTRYPOINT []

CMD ["catalina.sh", "run"]
```

{% endspoiler %}

#### FROM

**指定基础镜像**

基础镜像不存在会在Docker Hub上拉去(必须为第一条指令)

 使用格式：

```dockerfile
FROM <镜像>:[tag]

FROM <镜像>@digest[校验码] 
```

#### MAINTAINER

**提供Dockerfile制作者提供本人信息**

> [逐渐废弃] LABLE替代了MAINTANIER

```dockerfile
#使用格式
MAINTANIER "xxxx <作者邮箱>"
```

#### LABEL

**添加元数据（如作者、版本）**

```dockerfile
LABEL maintainer="your@email.com"
LABEL version="1.0"
```

#### ENV

**用于为docker容器设置环境变量**

ENV设置的环境变量，可以使用 `docker inspect`命令来查看。同时还可以使用`docker run --env =`来修改环境变量。

```dockerfile
#示例
ENV JAVA_HOME /usr/local/jdk
ENV JRE_HOME $JAVA_HOME/jre
ENV CLASSPATH $JAVA_HOME/lib/:$JRE_HOME/lib/
ENV PATH $PATH:$JAVA_HOME/bin/
```

#### USER

**切换运行用户，提升安全性。**

Docker 默认是使用 root，但若不需要，建议切换使用者身分，毕竟 root 权限太大了，使用上有安全的风险。

```dockerfile
USER xxx
```

#### WORKDIR

**切换/设置工作目录**

Docker 默认的工作目录是`/`，如果想让其他指令在指定的目录下执行，就得靠 WORKDIR。WORKDIR 动作的目录改变是持久的，不用每个指令前都使用一次 WORKDIR。

```dockerfile
WORKDIR  xxxx  #类似于 cd xxx
```

#### VOLUME

**定义匿名卷**

只能定义docker管理的卷，用来存放数据库和需要保持的数据等。

```dockerfile
VOLUME /var/lib/mysql
```

#### COPY

**把宿主机中的文件复制到镜像中去**

仅执行本地文件的直接复制，不能直接处理远程 URL 或自动解压压缩包，行为透明且可预测。

源文件要在Dockerfile工作目录下（不能超出上下文目录）

```dockerfile
# 复制单个文件
COPY app.py /usr/src/app/

# 复制目录（保留目录结构）
COPY static/ /var/www/html/static/

# 带权限设置
COPY --chown=1000:1000 config.yml /etc/app/
```

#### ADD

在 `COPY` 基础上扩展了**自动解压**和**远程 URL 下载**功能。

可直接从 HTTP/HTTPS 链接下载文件，支持自动解压 tar, gzip, bzip2, xz 等格式文件

```dockerfile
#命令格式
ADD [--chown=<user>:<group>] <源路径或URL>... <目标路径>

# 自动解压本地压缩包到目标目录
ADD app.tar.gz /opt/

# 从URL下载文件（不会自动解压）
ADD https://example.com/data.zip /tmp/
```



对比

- COPY：简单、安全、可预测，适用于绝大多数场景
- ADD：功能强大但需谨慎，仅在解压/下载时使用

#### EXPOSE

**声明容器运行时监听的端口，以实现与外部通信**

```dockerfile
EXPOSE 8080
```

#### RUN

**执行命令并创建新的镜像层**

由于命令行的强大能力，RUN 指令在定制镜像时是最常用的指令之一。其格式有两种：

- shell格式：`RUN <命令>`，就像直接在命令行中输入的命令一样。
- exec格式：`RUN ["可执行文件", "参数1", "参数2"]`，这更像是函数调用中的格式。



RUN 就像 Shell 脚本一样可以执行命令，那么我们是否就可以像 Shell 脚本一样把每个命令对应一个 RUN 呢？比如这样：

```dockerfile
#编译安装redis
RUN apt-get update
RUN apt-get install -y gcc libc6-dev make
RUN wget http://download.redis.io/releases/redis-4.0.1.tar.gz
RUN tar xzf redis-4.0.1.tar.gz
WORKDIR redis-4.0.1
```

Dockerfile 中每一个指令都会建立一层，RUN 也不例外。每一个 RUN 的行为，都是新建立一层，在其上执行这些命令，执行结束后，commit 这一层的修改，构成新的镜像。 而上面的这种写法，创建了多层镜像。这是完全没有意义的，而且很多运行时不需要的东西，都被装进了镜像里，比如编译环境、更新的软件包等等。结果就是产生非常臃肿、非常多层的镜像，不仅仅增加了构建部署的时间，也很容易出错。 

而且，Union FS 是有最大层数限制的，比如 AUFS，曾经是最大不得超过 42 层，现在是不得超过 127 层。

正确的写法如下：

```dockerfile
FROM centos
RUN apt-get update \
	&& apt-get install -y gcc libc6-dev make \
	&& wget http://download.redis.io/releases/redis-4.0.1.tar.gz \
	&& tar xzf redis-4.0.1.tar.gz \
	&& cd redis-4.0.1
```

首先，之前所有的命令只有一个目的，就是编译、安装 redis 可执行文件。因此没有必要建立很多层，这只是一层的事情。因此，这里没有使用很多个 RUN 对一一对应不同的命令，而是仅仅使用一个 RUN 指令，并使用 && 将各个所需命令串联起来。将之前的 7 层，简化为了 1 层。在撰写 Dockerfile 的时候，要经常提醒自己，这并不是在写 Shell脚本，而是在定义每一层该如何构建。 并且，这里为了格式化还进行了换行。Dockerfile 支持 Shell 类的行尾添加 \ 的命令换行方式，以及行首 # 进行注释的格式。

#### CMD

指定容器启动后要执行的操作。CMD指令的格式与RUN相似，也是两种格式。

```bash
CMD ["executable", "param1", "param2"]  # exec 形式（推荐）
CMD command param1 param2               # shell 形式
```

与RUN的区别：

- CMD是在docker run时运行。
- RUN是在 docker build时运行。

特点：

- Dockerfile中可以有多个 CMD指令，但只有最后一个生效。

- CMD 会被docker run 之后的参数覆盖

  ```bash
  Tomcat的Dockerfile最后CMD指令为
  CMD ["catalina.sh", "run"]
  
  #启动Tomcat时添加了参数 /bin/bash，
  docker run -it - p 8080:8080 57800e5b1cbf /bin/bash
  
  该命令参数类似于 CMD["/bin/bash", "run"],会将Dockerfile中的CMD命令覆盖
  ```

- 与 ENTRYPOINT 一起使用时，不再是直接运行其命令而是将CMD的内容作为参数传递给ENTRYPOINT指令，即为ENTRYPOINT 指定默认参数。

#### ENTRYPOINT

也是用来指定一个容器启动时要运行的命令。

类似于CMD指令，但是**ENTRYPOINT不会被docker run直接覆盖，需添加用 `--entrypoint` 参数进行覆盖，而且这些命令行参数会被当作参数送给ENTRYPOINT指令指定的程序**

```bash
ENTRYPOINT ["executable", "param1"]  # exec 形式（推荐）
ENTRYPOINT command param1            # shell 形式
```

最佳实践：与CMD配合使用，由它为ENTRYPOINT命令执行指定默认参数，同时可以被docker run 的参数替换。

```bash
ENTRYPOINT ["固定主命令"]  
CMD ["默认参数"]  
```

| Dockerfile 配置                     | `docker run` 命令                 | 最终执行的命令      |
| ----------------------------------- | --------------------------------- | ------------------- |
| `ENTRYPOINT ["echo"]` + `CMD ["A"]` | `docker run demo`                 | `echo "A"`          |
| `ENTRYPOINT ["echo"]` + `CMD ["A"]` | `docker run demo B`               | `echo "B"`          |
| `ENTRYPOINT ["echo"]` + `CMD ["A"]` | `docker run demo --entrypoint=ls` | `ls "A"` (异常情况) |

### 根据Dockerfile构建镜像

`docker build` 是 Docker 中最常用的命令之一，用于**根据 Dockerfile 构建镜像**。

```bash
#命令格式
docker build [OPTIONS] PATH | URL | -
```

- PATH：Dockerfile 所在的目录路径（构建上下文）。
- URL：远程 Git 仓库或 TAR 包（支持 git://, https://）。
- -：从标准输入（stdin）读取 Dockerfile（需配合 -f 指定文件）。

核心参数 OPTIONS：

- **`-f`**：指定 Dockerfile 文件名（非默认 `Dockerfile` 时使用）
- **`-t`**：指定镜像名称和标签（格式：`name:tag`）
- **`--build-arg`**：传递构建参数，该参数在 Dockerfile 中用 ARG 定义
- **`--no-cache`**：禁用缓存，强制重新构建
- **`--pull`**：总是拉取最新基础镜像（避免使用本地旧版本）
- **`--target`**：多阶段构建时指定目标阶段

示例：

```bash
#1、构建基础镜像
# . 表示当前目录是构建上下文，Dockerfile 需在此目录下
docker build -t myapp:1.0 .

#2、指定不同的 Dockerfile
# 使用 Dockerfile.prod 而非默认的 Dockerfile
docker build -f Dockerfile.prod -t myapp:prod 

#3、传递构建参数.
# Dockerfile的内容
ARG APP_VERSION=1.0
RUN echo "Building version ${APP_VERSION}"

#--build-arg 会覆盖 Dockerfile 中的默认值。
docker build --build-arg APP_VERSION=2.0 -t myapp:2.0 .


```



### 案例1

创建一个镜像（基于tomcat）里面要有一个index.html，并添加 hello tomcat。此外复制一个文件(图片)，并复制到容器中并能访问。

在宿主机中创建一个目录，在其中创建一个Dockerfile文件

```bash
mkdir -p /usr/local/docker/demo1
vim Dockerfile
```



Dockerfile文件内容如下：

```dockerfile
FROM tomcat:9
RUN mkdir /usr/local/tomcat/webapps/ROOT  #在tomcat的webapps目录下创建ROOT文件夹
RUN echo "<h1>hello tomcat</h1>">/usr/local/tomcat/webapps/ROOT/index.html 
COPY 1.jpg /usr/local/tomcat/webapps/ROOT #从当前目录下拷贝1.jpg到ROOT目录下
WORKDIR /usr/local/tomcat/webapps/ROOT  #切换工作目录到ROOT目录
```

由该Dockerfile文件构建镜像

```bash
docker build -t domo:0.1 . #从Dockerfile文件所在目录构建镜像
```

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250703194021801-2025-7-319:41:01.png" style="zoom:80%;" />

在该镜像的基础上创建容器，进入容器内部查看ROOT目录下的内容

```bash
docker run -d --name demo-8081 -p 8081:8080 domo:0.1
```

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250703194449000-2025-7-319:44:51.png)

访问该容器，查看效果

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250703194849761-2025-7-319:48:52.png)



### 案例2

要求：Docker部署SpringBoot微服务项目，微服务镜像制作

思路：以项目中的某一个微服务为例，首先使用maven工具打包生成jar文件，之后将其上传到linux服务器中，通过制定镜像完成微服务构建，最后运行多个容器来完成高可用、高并发等部署要求。

示例项目中存在两个微服务，准备将微服务1打包部署，该服务中只有一个Controller接口，返回一个字符串。

<img src="C:%5CUsers%5C86152%5CAppData%5CRoaming%5CTypora%5Ctypora-user-images%5Cimage-20250705173605638.png" style="zoom:80%;" />

部署流程：

1. 在linux服务中创建目录，保存jar文件

   ```bash
   mkdir -p /usr/local/docker/demo2
   ```

2. 编写Dockerfile文件

   ```dockerfile
   FROM openjdk:17
   VOLUME /tmp
   ADD ch-1-0.0.1-SNAPSHOT.jar ch1-boot.jar
   EXPOSE 8080
   ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/ch1-boot.jar"]
   ```

   - FROM：表示基础镜像，即运行环境。该项目java版本为17
   - VOLUME /tmp：创建/tmp目录并持久化到Docker数据文件夹，因为Spring Boot使用的内嵌Tomcat容器默认使用/tmp作为工作目录 
   - ADD：拷贝文件并且重命名，将jar文件拷贝到容器内部
   - EXPOSE：建立image的人员告诉容器布署人员容器应该映射哪个端口给外界
   - ENTRYPOINT：容器启动时运行的命令，相当于我们在命令行中输入java -jar xxxx.jar，为了缩短 Tomcat 的启动时间，添加java.security.egd的系统属性指向/dev/urandom作为 ENTRYPOINT

3. 制作镜像

   ```bash
   docker build -t ch1-boot:1.0 .  
   ```

4. 启动容器

   ```bash
   docker run --rm -d --name ch1-boot -p 8081:8080 ch1-boot:1.0
   ```

5. 查看日志

   ```bash
   docker logs ch1-boot
   ```

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250705192021485-2025-7-519:20:41.png" style="zoom:80%;" />

6. 访问接口查看效果

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250705192118436-2025-7-519:21:20.png" style="zoom:80%;" />

## 四、Docker实战高级

### IDEA整合Docker

1. Docker开启远程访问

   ```bash
   #修改该Docker服务文件
   vi /lib/systemd/system/docker.service
   #修改ExecStart这行
   ExecStart=/usr/bin/dockerd -H tcp://0.0.0.0:2375 -H unix:///var/run/docker.sock
   
   #重新加载配置文件
   systemctl daemon-reload
   #重启服务
   systemctl restart docker.service
   #查看端口是否开启
   netstat -nlpt 
   ```

2. IDEA安装docker插件后，配置Docker连接，连接成功后可在IDEA中操作Docker

   ![配置Docker连接](https://gitee.com/cmyk359/img/raw/master/img/image-20250705193427761-2025-7-519:34:53.png)

   ![查看Docker镜像、容器等信息](https://gitee.com/cmyk359/img/raw/master/img/image-20250705193747431-2025-7-519:37:49.png)

   ![根据镜像创建容器](C:%5CUsers%5C86152%5CAppData%5CRoaming%5CTypora%5Ctypora-user-images%5Cimage-20250705194647382.png)

3. 传统项目的打包，上传，生成镜像，部署等操作都可以再IDEA中使用插件:**docker-maven-plugin**自动完成，大大提高了开发效率。在项目的POM文件中添加插件配置：

   ```xml
   <properties>
       <!--设置镜像前缀-->
       <docker.image.prefix>com.hfut</docker.image.prefix>
   </properties>
   
   <plugin>
       <groupId>com.spotify</groupId>
       <artifactId>docker-maven-plugin</artifactId>
       <version>1.0.0</version>
       <dependencies>
           <dependency>
               <groupId>javax.activation</groupId>
               <artifactId>activation</artifactId>
               <version>1.1.1</version>
           </dependency>
       </dependencies>
       <configuration>
           <!-- 镜像名称 xxx/yyy-->
           <imageName>${docker.image.prefix}/${project.artifactId}</imageName>
           <!--指定标签 为项目版本-->
           <imageTags>
               <imageTag>${project.version}</imageTag>
           </imageTags>
           <!-- 基础镜像jdk-->
           <baseImage>openjdk:17</baseImage>
           <!-- 制作者提供本人信息 -->
           <maintainer>lh cmyk359@163.com</maintainer>
           <!--切换到/ROOT目录 -->
           <workdir>/ROOT</workdir>
           <cmd>["java", "-version"]</cmd>
           <entryPoint>["java", "-jar", "${project.build.finalName}.jar"]</entryPoint>
           <!-- 指定 Dockerfile 路径
                       <dockerDirectory>${project.basedir}/src/main/docker</dockerDirectory>
                       -->
           <!--指定远程 docker api地址-->
           <dockerHost>http://192.168.181.100:2375</dockerHost>
           <!-- 这里是复制 jar 包到 docker 容器指定目录配置 -->
           <resources>
               <resource>
                   <targetPath>/ROOT</targetPath>
                   <!--用于指定需要复制的根目录，${project.build.directory}表示target目录-->
                   <directory>${project.build.directory}</directory>
                   <!--用于指定需要复制的文件。${project.build.finalName}.jar指的是打包后的jar
                               包文件。-->
                   <include>${project.build.finalName}.jar</include>
               </resource>
           </resources>
       </configuration>
   </plugin>
   ```

   该插件最终会生成如下内容的Dockerfile

   ```dockerfile
   FROM openjdk:17
   MAINTAINER lh cmyk359@163.com
   WORKDIR /ROOT
   ADD /ROOT/xxx.jar /ROOT
   ENTRYPOINT ["java", "-jar", "xxx.jar"]
   CMD ["java", "-version"]
   ```

   

4. 对项目打包，并制作镜像上传到Docker

   ```bash
   mvn clean package docker:build
   ```

   ![image-20250705213949252](https://gitee.com/cmyk359/img/raw/master/img/image-20250705213949252-2025-7-521:39:52.png)

5. 扩展配置：绑定Docker 命令到 Maven 各个阶段。

   把 Docker 分为 build、tag、push，然后分别绑定 Maven 的 package、deploy 阶段。只用执行maven的package阶段，就能自动完成上述所有操作

   ```xml
   <executions>
       <!--当执行mvn package 时，执行： mvn clean package docker:build -->
       <execution>
           <id>build-image</id>
           <phase>package</phase>
           <goals>
               <goal>build</goal>
           </goals>
       </execution>
       <!--当执行mvn package 时，会对镜像进行 标签设定-->
       <execution>
           <id>tag-image</id>
           <phase>package</phase>
           <goals>
               <goal>tag</goal>
           </goals>
           <configuration>
               <image>${docker.image.prefix}/${project.artifactId}:latest</image>
               <newName>docker.io/${docker.image.prefix}/${project.artifactId}:${project.version}
               </newName>
           </configuration>
       </execution>
       
       <execution>
           <id>push-image</id>
           <phase>deploy</phase>
           <goals>
               <goal>push</goal>
           </goals>
           <configuration>
               <imageName>docker.io/${docker.image.prefix}/${project.artifactId}:${project.version}
               </imageName>
           </configuration>
       </execution>
   </executions>
   ```

   完整POM文件

   ```xml
   <properties>
       <!--设置镜像名称前缀-->
       <docker.image.prefix>com.hfut</docker.image.prefix>
   </properties>
   
   <plugin>
       <groupId>com.spotify</groupId>
       <artifactId>docker-maven-plugin</artifactId>
       <version>1.0.0</version>
       <dependencies>
           <dependency>
               <groupId>javax.activation</groupId>
               <artifactId>activation</artifactId>
               <version>1.1.1</version>
           </dependency>
       </dependencies>
       <configuration>
           <!-- 镜像名称 xxx/yyy-->
           <imageName>${docker.image.prefix}/${project.artifactId}</imageName>
           <!--指定标签 为项目版本-->
           <imageTags>
               <imageTag>${project.version}</imageTag>
           </imageTags>
           <!-- 基础镜像jdk-->
           <baseImage>openjdk:17</baseImage>
           <!-- 制作者提供本人信息 -->
           <maintainer>lh cmyk359@163.com</maintainer>
           <!--切换到/ROOT目录 -->
           <workdir>/ROOT</workdir>
           <cmd>["java", "-version"]</cmd>
           <entryPoint>["java", "-jar", "${project.build.finalName}.jar"]</entryPoint>
           <!-- 指定 Dockerfile 路径
                       <dockerDirectory>${project.basedir}/src/main/docker</dockerDirectory>
                       -->
           <!--指定远程 docker api地址-->
           <dockerHost>http://192.168.181.100:2375</dockerHost>
           <!-- 这里是复制 jar 包到 docker 容器指定目录配置 -->
           <resources>
               <resource>
                   <targetPath>/ROOT</targetPath>
                   <!--用于指定需要复制的根目录，${project.build.directory}表示target目录-->
                   <directory>${project.build.directory}</directory>
                   <!--用于指定需要复制的文件。${project.build.finalName}.jar指的是打包后的jar
                               包文件。-->
                   <include>${project.build.finalName}.jar</include>
               </resource>
           </resources>
       </configuration>
   
       <executions>
           <!--当执行mvn package 时，执行： mvn clean package docker:build -->
           <execution>
               <id>build-image</id>
               <phase>package</phase>
               <goals>
                   <goal>build</goal>
               </goals>
           </execution>
       </executions>
   </plugin>
   ```

   

### IDEA整合Docker加密验证

前面提到的配置是允许所有人都可以访问的，因为docker默认是root权限的，把2375端口暴露在外面，意味着别人随时都可以提取到你服务器的root权限，是很容易被黑客黑的，因此,docker官方推荐使用加密的tcp连接，以Https的方式与客户端建立连接。

1. 创建ca文件夹，存放CA私钥和公钥

   ```bash
   mkdir -p /usr/local/ca
   cd /usr/local/ca/
   ```

2. 生成CA私钥和公钥

   记住设置的ca-key，后面还会用

   ```bash
   openssl genrsa -aes256 -out ca-key.pem 4096
   ```

3. 设置秘钥验证信息

   依次输入密码、国家、省、市、组织名称、邮箱等信息

   ```bash
   openssl req -new -x509 -days 365 -key ca-key.pem -sha256 -out ca.pem
   ```

4. 生成server-key.pem

   现在已经有了CA，接下来创建一个服务器密钥和证书签名请求(CSR)。确保“公用名”与你用来连接到Docker的主机名匹配

   ```bash
   openssl genrsa -out server-key.pem 4096
   ```

5. 使用CA签署公钥

   由于TLS连接可以通过IP地址和DNS名称进行，所以在创建证书时需要指定IP地址。例如，允许使用10.10.10.20和127.0.0.1进行连接

   ```bash
   # $Host换成你自己服务器外网的IP或者域名
   openssl req -subj "/CN=$HOST" -sha256 -new -key server-key.pem -out server.csr
   比如
   openssl req -subj "/CN=192.168.20.135" -sha256 -new -key server-key.pem -out server.csr
   或
   openssl req -subj "/CN=www.javaqf.com" -sha256 -new -key server-key.pem -out server.csr
   ```

   ```bash
   #此处使用虚拟机ip地址
   openssl req -subj "/CN=192.168.181.100" -sha256 -new -key server-key.pem -out server.csr
   ```

6. 配置白名单

   指定可以连接到Docker服务器的ip地址，多个ip用号分隔开。因为已经准备使用秘钥进行ssl连接，故ip地址可以配置为0.0.0.0，所有ip都可以连接，但只有拥有证书的才可以连接成功。

   ```bash
   echo subjectAltName = IP:0.0.0.0 >> extfile.cn
   ```

7. 设置秘钥

   将Docker守护程序密钥的扩展使用属性设置为仅用于服务器身份验证:

   ```bash
   echo extendedKeyUsage = serverAuth >> extfile.cnf
   ```

8. 生成签名证书

   ```bash
   openssl x509 -req -days 365 -sha256 -in server.csr -CA ca.pem -CAkey ca-key.pem \
   -CAcreateserial -out server-cert.pem -extfile extfile.cnf
   ```

9. 生成客户端的key.pem

   ```bash
   openssl genrsa -out key.pem 4096
   
   openssl req -subj '/CN=client' -new -key key.pem -out client.csr
   ```

10. 使密钥适合客户端身份验证

    创建扩展配置文件

    ```bash
    echo extendedKeyUsage = clientAuth >> extfile.cnf
    
    echo extendedKeyUsage = clientAuth > extfile-client.cnf
    ```

11. 生成签名证书

    ```bash
    openssl x509 -req -days 365 -sha256 -in client.csr -CA ca.pem -CAkey ca-key.pem \
    -CAcreateserial -out cert.pem -extfile extfile-client.cnf
    ```

12. 删除不需要的文件

    生成cert.pem和server-cert之后，就可以安全地删除两个证书签名请求和扩展配置文件:

    ```bash
    rm -v client.csr server.csr extfile.cnf extfile-client.cnf
    ```

13. 修改权限

    ```bash
    #要保护您的密钥免受意外损坏，请删除其写入权限。要使它们只能被您读取，更改文件模式
    chmod -v 0400 ca-key.pem key.pem server-key.pem
    #证书可以是对外可读的，删除写入权限以防止意外损坏
    chmod -v 0444 ca.pem server-cert.pem cert.pem
    ```

14. 归集服务器证书

    ```bash
    cp server-*.pem /etc/docker/
    cp ca.pem /etc/docker/
    ```

15. 修改Docker配置

    使Docker守护程序仅接受来自提供CA信任的证书的客户端的连接

    ```bash
    vim /lib/systemd/system/docker.service
    将
    ExecStart=/usr/bin/dockerd
    替换为：
    ExecStart=/usr/bin/dockerd --tlsverify --tlscacert=/usr/local/ca/ca.pem --tlscert=/usr/local/ca/server-cert.pem --tlskey=/usr/local/ca/server-key.pem -H tcp://0.0.0.0:2375 -H unix:///var/run/docker.sock
    ```

16. 开放2375端口

    ```bash
    /sbin/iptables -I INPUT -p tcp --dport 2375 -j ACCEPT
    ```

    

17. 重启Docker

    ```bash
    systemctl daemon-reload
    systemctl restart docker
    ```

18. 保存相关客户端的pem文件到本地

    将当前目录下的这四个文件拷贝到windows客户端，建立一个文件夹保存它们

    ![](https://gitee.com/cmyk359/img/raw/master/img/image-20250705222702788-2025-7-522:27:31.png)

19. IDEA CA配置

    ![image-20250705223322705](https://gitee.com/cmyk359/img/raw/master/img/image-20250705223322705-2025-7-522:33:45.png)

20. 修改之前pom插件中设置的Docker连接，从http改为https

    ```xml
    <!--指定远程 docker api地址-->
    <dockerHost>https://192.168.181.100:2375</dockerHost>
    ```

### 图形化界面

docker 图形页面管理工具常用的有三种，DockerUI ，**Portainer** ，Shipyard 。DockerUI 是 Portainer 的前身，这三个工具通过docker api来获取管理的资源信息。平时我们常常对着shell对着这些命令行客户端，审美会很疲劳，如果有漂亮的图形化界面可以直观查看docker资源信息，也是非常方便的。今天我们就搭建单机版的三种常用图形页面管理工具。这三种图形化管理工具以**Portainer**最为受欢迎。

```bash
# portainer镜像下载
docker pull portainer/portainer
# 创建容器
docker run -d --name portainerUI -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock \
--restart unless-stopped \
portainer/portainer

#查看开发端口列表
firewall-cmd --list-ports
#开放9000端口
firewall-cmd --zone=public --add-port=9000/tcp --permanent
#重启防火墙
firewall-cmd --reload
```

访问http://192.168.100:9000

![image-20250705225018020](https://gitee.com/cmyk359/img/raw/master/img/image-20250705225018020-2025-7-522:50:45.png)

### 搭建CIG重量级监控平台

[参考](https://www.bilibili.com/video/BV1gr4y1U7CY?spm_id_from=333.788.videopod.episodes&vd_source=51d78ede0a0127d1839d6abf9204d1ee&p=90)

## 五、持续集成/持续交付

### DockerCompse

Compose 项目是 Docker 官方的开源项目，负责实现对 Docker 容器集群的快速编排，其定位是：**定义和运行多个 Docker 容器的应用**

使用一个 Dockerfile 模板文件，可以让用户很方便的定义一个单独的应用容器。然而，在日常工作中，经常会碰到需要多个容器相互配合来完成某项任务的情况。例如要实现一个 Web 项目，除了 Web 服务容器本身，往往还需要再加上后端的数据库服务容器，甚至还包括负载均衡容器等。

Compose 恰好满足了这样的需求。**它允许用户通过一个单独的 docker-compose.yml 模板文件（来定**
**义一组相关联的应用容器为一个项目。**

***

Compose中有两个重要概念：

- 服务（service）：一个 服务 对应一个容器化的应用组件（如 Web 服务器、数据库、缓存等），在 docker-compose.yml 文件中通过 services 块配置。
- 项目（project）：一个 项目 是一组关联服务的集合，代表一个完整的应用

Compose 的默认管理对象是**项目**，通过子命令对项目中的一组容器进行便捷地生命周期管理。

Compose 项目由 Python 编写，实现上调用了 Docker 服务提供的 API 来对容器进行管理。因此，只要所操作的平台支持 Docker API，就可以在其上利用 Compose 来进行编排管理。

#### Docker Compose安装

1. 从[Docker Compose](https://github.com/docker/compose/releases)的github仓库，下载RELEASE版本的文件

2. 安装

   ```bash
   #1.将下载好的文件拖入Linux 并剪切到 /usr/local目录下
   mv docker-compose-Linux-x86_64 /usr/local
   #2. 修改名称（为后面方便调用） 并 修改其为可执行文件
   mv docker-compose-Linux-x86_64 docker-compose
   chmod 777 docker-compose
   mv docker-compose /usr/local/bin/
   ```

3. 验证

   ```bash
   [root@ai100 ~]# docker-compose --version
   Docker Compose version v2.36.0
   ```

   

#### Docker Compose的使用

常用命令：

- build 构建或重建服务

- help 命令帮助

- kill 杀掉容器

- logs 显示容器的输出内容

- port 打印绑定的开放端口

- ps 显示容器pull 拉取服务镜像

- restart 重启服务

- rm 删除停止的容器

- run 运行一个一次性命令

- scale 设置服务的容器数目

- start 开启服务

- stop 停止服务

- up 创建并启动容器

- down 关闭并删除容器

用compose的方式管理一个Tomcat容器和MySQL

```yaml
#1 管理文件夹，创建相应的目录
mkdir -p /opt/docker_mysql_tomcat/

#2 在如上目录中 编写创建 docker-compose.yml配置文件
version: '3.1'
services:
  mysql: # 服务的名称
    restart: always # 只要docker启动，容器会随着启动
    image: daocloud.io/library/mysql:5.7.6 # 指定镜像路径信息（默认官方镜像地址)
    container_name: mysql-3306 # 指定容器名称 --name
    ports:
      - 3306:3306 #指定端口号映射
    environment:
      MYSQL_ROOT_PASSWORD: root #指定MYSQL ROOT用户的密码
      TZ: Asiz/Shanghai #指定时区
    volumes:
      - /opt/docker_mysql_tomcat/mysql/data:/var/lib/mysql #映射mysql的数据目录到宿主机，保存数据
      - /opt/docker_mysql_tomcat/mysql/conf/mysqld.cnf:/etc/mysql/mysql.conf.d/mysqld.cnf #把mysql的配置文件映射到容器的相应目录
  tomcat:
    restart: always
    image: daocloud.io/library/tomcat:8.5.15-jre8
    container_name: tomcat-8080
    ports:
      - 8080:8080
    environment:
      TZ: Asiz/Shanghai
    volumes:
      - /opt/docker_mysql_tomcat/tomcat/webapps:/usr/local/tomcat/webapps
      - /opt/docker_mysql_tomcat/tomcat/logs:/usr/local/tomcat/logs
```



#### tomcat集群搭建

#### redis集群搭建



### 基于Docker+Jenkins+Gitlab搭建持续集成环境