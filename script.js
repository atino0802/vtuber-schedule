// 測試用的直播資料
const streams = [
  {
    title: "【MV】Odyssey - Hololive English (Original Song)",
    url: "https://youtu.be/0wO8d70KSXw",
    startTime: "2025-08-15T20:00+08:00",
  },
  {
    title: "Calli 雜談直播（測試用）",
    url: "https://youtu.be/dQw4w9WgXcQ",
    startTime: "2025-08-29T22:00+08:00",
  },
  {
    title: "[MV] end of a life - Calliope Mori (Original Song)",
    url: "https://youtu.be/BXB26PzV31k",
    startTime: "2025-08-02T20:00+08:00",
  },
];

// 把時間字串轉成 Date 並排序（從早到晚）
streams.sort((a, b) => new Date(a.time) - new Date(b.time));

// 區塊化建立每個直播資料
const streamsContainer = document.getElementById("streams-list"); //抓取容器
streams.forEach((stream) => {
  const div = document.createElement("div"); //建立新卡片
  div.className = "stream"; //上標籤stream

  // 新增倒數顯示的元素
  const countdownElement = document.createElement("p"); //建立元素"p"名字是countdownElement
  countdownElement.className = "countdown"; //上標籤countdown
  countdownElement.textContent = "倒數計算中..."; //實際顯示時間之前的佔位文字

  // 將所有元素放入卡片中
  div.innerHTML = `
    <h3>${stream.title}</h3>
    <p>開始時間：${new Date(stream.startTime).toLocaleString()}</p>
  `;
  div.appendChild(countdownElement);
  streamsContainer.appendChild(div);

  // 初始化並每分鐘更新倒數
  setTimeout(() => {
    div.appendChild(countdownElement); //延遲三秒
    updateCountdown(stream.startTime, countdownElement); //剛開網頁就跑一次
    setInterval(() => {
      updateCountdown(stream.startTime, countdownElement); //一分鐘重跑一次
    }, 60 * 1000);
  }, 3000);
});

function updateCountdown(startTime, element) {
  const now = new Date(); //拿到現在時間，單位都是毫秒
  const diff = new Date(startTime) - now; //拿到開始時間，相減正數表未到，負數表開始

  if (diff <= 0) {
    element.textContent = "已經開始！";
    return;
  }

  const hours = Math.floor(diff / (1000 * 60 * 60)); //1000 毫秒 × 60 秒 × 60 分，Math.floor無條件捨去小數點
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)); //只要捨棄小時的餘數毫秒/每分鐘毫秒
  element.textContent = `倒數：${hours} 小時 ${minutes} 分`;
}

//從data.json抓取資料並顯示出來
/*fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    const container = document.getElementById("streams-list");

    data.forEach((stream) => {
      const card = document.createElement("div");
      card.className = "card";

      // 新增倒數顯示的元素
      const countdownElement = document.createElement("p"); //建立元素"p"名字是countdownElement
      countdownElement.className = "countdown"; //上標籤countdown
      countdownElement.textContent = "倒數計算中..."; //實際顯示時間之前的佔位文字

      card.innerHTML = `
        <h2>${stream.vtuber}</h2>
        <p><strong>標題：</strong>${stream.title}</p>
        <p><strong>時間：</strong>${new Date(
          stream.startTime
        ).toLocaleString()}</p>
        <p><strong>平台：</strong>${stream.platform}</p>
      `;
      card.appendChild(countdownElement);

      container.appendChild(card);

      // 初始化並每分鐘更新倒數
      setTimeout(() => {
        card.appendChild(countdownElement); //延遲三秒
        updateCountdown(stream.startTime, countdownElement); //剛開網頁就跑一次
        setInterval(() => {
          updateCountdown(stream.startTime, countdownElement); //一分鐘重跑一次
        }, 60 * 1000);
      }, 3000);
    });
  })
  .catch((error) => {
    console.error("讀取 JSON 發生錯誤：", error);
  });*/

document.addEventListener("DOMContentLoaded", () => {
  fetchMoriStreams(); // 自動抓取
});

function fetchMoriStreams() {
  fetch(
    "https://holodex.net/api/v2/channels/UCMwGHR0BTZuLsmjY_NT5Pwg/videos?type=stream&limit=5",
    {
      headers: {
        "X-APIKEY": "fbe36b98-eddb-4db1-9df8-83a4fb6d34f0", // ← 這裡換成你自己的金鑰
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const container = document.getElementById("streams-list");
      container.innerHTML = ""; // 清空原本內容

      data.forEach((stream) => {
        if (stream.status === "upcoming") {
          const card = document.createElement("div");
          card.className = "card";
          
          const thumbnailUrl = stream.thumbnail || `https://i.ytimg.com/vi/${stream.id}/hqdefault.jpg`;
          card.innerHTML = `
          <img src="${thumbnailUrl}" alt="${stream.title}" class="thumbnail">
          <h2>${stream.title}</h2>
          <p><strong>時間：</strong>${new Date(
            stream.available_at
          ).toLocaleString()}</p>
          <p><strong>頻道：</strong>${stream.channel.name}</p>
          <a href="https://www.youtube.com/watch?v=${
            stream.id
          }" target="_blank">🔗 前往直播</a>
        `;

          container.appendChild(card);
        }
      });
    })
    .catch((error) => {
      console.error("讀取 Holodex API 發生錯誤：", error);
    });
}
