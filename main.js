const HOLODEX_API_URL = "https://holodex.net/api/v2/videos";
const HOLODEX_API_KEY = "fbe36b98-eddb-4db1-9df8-83a4fb6d34f0";

// 取得所有 group 與 gen 選項
// 前端快取所有影片資料
let allStreamsCache = null;
function getAllGroupsAndGens(vtubers) {
  const groups = new Set();
  const gens = new Set();
  vtubers.forEach((v) => {
    (Array.isArray(v.group) ? v.group : [v.group]).forEach((g) =>
      groups.add(g)
    );
    (Array.isArray(v.gen) ? v.gen : [v.gen]).forEach((g) => gens.add(g));
  });
  return { groups: Array.from(groups), gens: Array.from(gens) };
}

// 主要分區 group 與對應 gen
const MAIN_GROUPS = ["EN", "JP", "ID"];
const GROUP_GEN_MAP = {
  EN: ["myth", "promise", "advent", "justice"],
  JP: [
    "gen0",
    "gen1",
    "gen2",
    "gamers",
    "gen3",
    "gen4",
    "gen5",
    "holox",
    "regloss",
    "flowglow",
  ],
  ID: ["gen1", "gen2", "gen3"],
};

// 動態產生群組與世代按鈕
function renderFilterButtons() {
  const groupBar = document.getElementById("group-buttons");
  const genBar = document.getElementById("gen-buttons");
  groupBar.innerHTML = "";
  genBar.innerHTML = "";

  // 第一排 group 按鈕
  ["ALL", ...MAIN_GROUPS].forEach((group) => {
    const btn = document.createElement("button");
    btn.textContent = group;
    btn.dataset.group = group;
    // ALL 按鈕在 group 為 null 或 ALL 時都高亮
    const isActive = (group === "ALL" && (!activeFilter.group || activeFilter.group === "ALL")) || (activeFilter.group === group);
    btn.className = "filter-btn" + (isActive ? " active" : "");
    btn.onclick = () => {
      setActiveFilter("group", btn.dataset.group);
    };
    groupBar.appendChild(btn);
  });

  // 第二排 gen 按鈕，依 group 顯示
  let gens = [];
  if (!activeFilter.group || activeFilter.group === "ALL") {
    genBar.innerHTML = "";
    return;
  }
  gens = GROUP_GEN_MAP[activeFilter.group] || [];
  ["ALL", ...gens].forEach((gen) => {
    const btn = document.createElement("button");
    btn.textContent = gen;
    btn.dataset.gen = gen;
    // ALL 按鈕在 gen 為 null 或 ALL 時都高亮
    const isActive = (gen === "ALL" && (!activeFilter.gen || activeFilter.gen === "ALL")) || (activeFilter.gen === gen);
    btn.className = "filter-btn" + (isActive ? " active" : "");
    btn.onclick = () => {
      setActiveFilter("gen", btn.dataset.gen);
    };
    genBar.appendChild(btn);
  });
}

// 儲存目前的過濾條件
let activeFilter = { group: null, gen: null };

// 設定過濾條件並重新渲染
function setActiveFilter(type, value) {
  const prev = activeFilter[type];
  // 點 ALL 時，永遠設為 null，並強制 renderAll
  if (value === "ALL") {
    activeFilter[type] = null;
    // 如果是 group，切換時 gen 也預設為 ALL
    if (type === "group") {
      activeFilter.gen = null;
    }
    renderFilterButtons();
    // 只在 filter 狀態真的有變動時才 renderAll
    if (prev !== null) renderAll();
    return;
  }
  // 其他情況維持原本 toggle 行為
  const newValue = activeFilter[type] === value ? null : value;
  if (activeFilter[type] !== newValue) {
    activeFilter[type] = newValue;
    // 如果是 group，切換時 gen 也預設為 ALL
    if (type === "group") {
      activeFilter.gen = null;
    }
    renderFilterButtons();
    renderAll();
  }
}

// 取得目前過濾後的 vtuber 名單
function getFilteredVtubers() {
  return vtubers.filter((v) => {
    // 將 group 和 gen 都轉小寫比對，避免大小寫不一致
    const filterGroup = activeFilter.group
      ? activeFilter.group.toLowerCase()
      : null;
    const filterGen = activeFilter.gen ? activeFilter.gen.toLowerCase() : null;
    const vGroups = Array.isArray(v.group)
      ? v.group.map((g) => g.toLowerCase())
      : [v.group.toLowerCase()];
    const vGens = Array.isArray(v.gen)
      ? v.gen.map((g) => g.toLowerCase())
      : [v.gen.toLowerCase()];
    const groupMatch = !filterGroup || vGroups.includes(filterGroup);
    const genMatch = !filterGen || vGens.includes(filterGen);
    return groupMatch && genMatch;
  });
}

// 取得 vtuber 的 channelId 陣列
function getFilteredChannelIds() {
  return getFilteredVtubers().map((v) => v.channelId);
}

// 取得 Holodex 直播資料
async function fetchStreamData(channelIds) {
  if (!channelIds.length) return [];
  if (!channelIds.length) return [];
  const promises = channelIds.map(channelId => {
    const url = `https://holodex.net/api/v2/channels/${channelId}/videos?type=stream&limit=3`;
    return fetch(url, {
      headers: HOLODEX_API_KEY ? { "X-APIKEY": HOLODEX_API_KEY } : {},
    })
      .then(res => {
        if (!res.ok) {
          console.warn(`頻道 ${channelId} 查詢失敗，HTTP ${res.status}`);
          return [];
        }
        return res.json();
      })
      .catch(err => {
        console.warn(`頻道 ${channelId} 查詢異常:`, err);
        return [];
      });
  });
  const results = await Promise.all(promises);
  // 合併所有頻道的影片
  return results.flat().filter(v => v);
}

// 渲染直播卡片
function renderStreamCards(streams) {
  const container = document.getElementById("stream-container");
  container.innerHTML = "";
  if (!streams.length) {
    container.innerHTML = "<div class='empty'>目前沒有影片</div>";
    return;
  }
  streams.forEach((stream) => {
    container.appendChild(createCard(stream));
  });
}

// 建立單一直播卡片
function createCard(stream) {
  const card = document.createElement("div");
  card.className = "card";
  // 影片時間優先顯示 available_at，其次 published_at，再其次 start_scheduled
  const time = stream.available_at || stream.published_at || stream.start_scheduled || "";
  // 直接用 YouTube 官方縮圖格式
  let thumbUrl = `https://i.ytimg.com/vi/${stream.id}/hqdefault.jpg`;
  console.log(stream);
  // 計算剩餘時間或已結束
  let remainHtml = '';
  if (time) {
    const now = new Date();
    const start = new Date(time);
    // 更精準判斷直播狀態
    if (stream.status === 'live' && !stream.actual_end_at) {
      remainHtml = `<div class="remain live">直播中</div>`;
    } else if (stream.status === 'ended' || stream.actual_end_at || start < now) {
      remainHtml = `<div class="remain end">已結束</div>`;
    } else if (now < start) {
      // 尚未開始，顯示倒數（只顯示天 小時 分）
      const diff = start - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      let remainText = '';
      if (days > 0) remainText += `${days} 天 `;
      if (hours > 0 || days > 0) remainText += `${hours} 小時 `;
      remainText += `${mins} 分`;
      remainHtml = `<div class="remain">剩餘 ${remainText}</div>`;
    }
  }
  card.innerHTML = `
    <img src="${thumbUrl}" alt="縮圖" class="card-thumbnail" />
    <div class="card-info">
      <div class="title">${stream.title}</div>
      <div class="channel">${stream.channel?.name || ""}</div>
      <div class="time">${formatTime(time)}</div>
      ${remainHtml}
      <a href="https://www.youtube.com/watch?v=${stream.id}" target="_blank" class="yt-link">觀看</a>
    </div>
  `;
  return card;
}

// 時間格式化
function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("zh-TW", { hour12: false });
}

// 顯示錯誤訊息
function showError(msg) {
  const container = document.getElementById("stream-container");
  container.innerHTML = `<div class="error">${msg}</div>`;
}

// 主渲染流程
async function renderAll() {
  // 第一次載入才抓 API，之後都用快取
  // 支援 isBackground 參數，只有第一次載入才顯示 loading
  const isBackground = arguments[0] === true;
  const allChannelIds = vtubers.map(v => v.channelId);
  if (!allStreamsCache || renderAll.forceRefresh) {
    if (!isBackground) {
      document.getElementById("stream-container").innerHTML =
        "<div class='loading'>載入中...</div>";
    }
    const streams = await fetchStreamData(allChannelIds);
    allStreamsCache = streams;
    renderAll.forceRefresh = false;
  }
  renderStreamCards(getFilteredStreams());
}

// 每分鐘自動刷新資料
setInterval(() => {
  renderAll.forceRefresh = true;
  renderAll(true); // 自動刷新時不顯示 loading
}, 60000);


// 依目前 filter 狀態分類快取資料
function getFilteredStreams() {
  if (!allStreamsCache) return [];
  // 取得目前過濾後的 vtuber channelId
  const channelIds = getFilteredChannelIds();
  // 只顯示屬於目前 filter 的頻道影片
  return allStreamsCache.filter(stream => channelIds.includes(stream.channel?.id));
}

// 初始化
function init() {
  renderFilterButtons();
  renderAll(false); // 第一次載入顯示 loading
}

window.onload = init;
