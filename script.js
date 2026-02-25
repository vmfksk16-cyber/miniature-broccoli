diff --git a/script.js b/script.js
new file mode 100644
index 0000000000000000000000000000000000000000..51b52d443b1a4f9d1a9b95db8341b0ef3ae7ed30
--- /dev/null
+++ b/script.js
@@ -0,0 +1,341 @@
+const state = {
+  recipes: [
+    {
+      crop: "상추",
+      temp: 21,
+      humidity: 68,
+      days: 30,
+      stages: "1-10일:23/72, 11-20일:21/68, 21-30일:19/65",
+    },
+  ],
+  inventory: [
+    { name: "상추", type: "생산물", quantity: 120, unit: "kg" },
+    { name: "복합비료", type: "비료", quantity: 40, unit: "포대" },
+  ],
+  projects: [
+    {
+      project: "3월 대형마트 납품",
+      client: "OO마트",
+      crop: "상추",
+      target: 200,
+      stock: 120,
+      planned: 60,
+    },
+  ],
+  schedules: [
+    { crop: "상추", sector: "A-1", start: "2026-03-01", end: "2026-03-25" },
+    { crop: "토마토", sector: "B-2", start: "2026-03-05", end: "2026-04-10" },
+  ],
+};
+
+const recipeForm = document.querySelector("#recipe-form");
+const inventoryForm = document.querySelector("#inventory-form");
+const projectForm = document.querySelector("#project-form");
+const scheduleForm = document.querySelector("#schedule-form");
+
+const recipeTable = document.querySelector("#recipe-table");
+const inventoryTable = document.querySelector("#inventory-table");
+const projectTable = document.querySelector("#project-table");
+const barChart = document.querySelector("#bar-chart");
+const ganttChart = document.querySelector("#gantt-chart");
+
+const homeBarChart = document.querySelector("#home-bar-chart");
+const homeGanttChart = document.querySelector("#home-gantt-chart");
+const kpiCards = document.querySelector("#kpi-cards");
+const homeRecentRecipes = document.querySelector("#home-recent-recipes");
+const homeRecentInventory = document.querySelector("#home-recent-inventory");
+const homeRecentProjects = document.querySelector("#home-recent-projects");
+
+const ganttTemplate = document.querySelector("#gantt-row-template");
+const tabButtons = document.querySelectorAll(".tab-btn");
+const tabPanels = document.querySelectorAll(".tab-panel");
+
+function numberValue(form, key) {
+  return Number(form.elements[key].value);
+}
+
+function toDate(value) {
+  return new Date(`${value}T00:00:00`);
+}
+
+function diffDays(start, end) {
+  const ms = toDate(end) - toDate(start);
+  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1);
+}
+
+function switchTab(tabName) {
+  tabButtons.forEach((button) => {
+    button.classList.toggle("active", button.dataset.tab === tabName);
+  });
+
+  tabPanels.forEach((panel) => {
+    panel.classList.toggle("active", panel.dataset.panel === tabName);
+  });
+}
+
+function renderRecipes() {
+  recipeTable.innerHTML = "";
+  state.recipes.forEach((recipe) => {
+    const row = document.createElement("tr");
+    row.innerHTML = `
+      <td>${recipe.crop}</td>
+      <td>${recipe.temp}°C</td>
+      <td>${recipe.humidity}%</td>
+      <td>${recipe.days}일</td>
+      <td>${recipe.stages || "-"}</td>
+    `;
+    recipeTable.appendChild(row);
+  });
+}
+
+function renderInventory() {
+  inventoryTable.innerHTML = "";
+  state.inventory.forEach((item) => {
+    const row = document.createElement("tr");
+    row.innerHTML = `
+      <td>${item.name}</td>
+      <td>${item.type}</td>
+      <td>${item.quantity}</td>
+      <td>${item.unit}</td>
+    `;
+    inventoryTable.appendChild(row);
+  });
+}
+
+function buildProjectBarItems(container) {
+  container.innerHTML = "";
+
+  if (!state.projects.length) {
+    container.innerHTML = '<div class="empty-msg">프로젝트 데이터가 없습니다.</div>';
+    return;
+  }
+
+  state.projects.forEach((project) => {
+    const total = project.target || 1;
+    const progressRaw = project.stock + project.planned;
+    const progress = Math.min(100, Math.round((progressRaw / total) * 100));
+
+    const item = document.createElement("div");
+    item.className = "bar-item";
+    item.innerHTML = `
+      <div class="bar-label">${project.project} (${project.client}) - ${progressRaw} / ${project.target}</div>
+      <div class="bar-track">
+        <div class="bar-fill" style="width:${progress}%"></div>
+      </div>
+    `;
+    container.appendChild(item);
+  });
+}
+
+function renderProjects() {
+  projectTable.innerHTML = "";
+
+  state.projects.forEach((project) => {
+    const row = document.createElement("tr");
+    row.innerHTML = `
+      <td>${project.project}</td>
+      <td>${project.client}</td>
+      <td>${project.crop}</td>
+      <td>${project.target}</td>
+      <td>${project.stock}</td>
+      <td>${project.planned}</td>
+    `;
+    projectTable.appendChild(row);
+  });
+
+  buildProjectBarItems(barChart);
+}
+
+function buildGanttRows(container) {
+  container.innerHTML = "";
+
+  if (!state.schedules.length) {
+    container.innerHTML = '<div class="empty-msg">일정이 없습니다.</div>';
+    return;
+  }
+
+  const starts = state.schedules.map((schedule) => toDate(schedule.start).getTime());
+  const ends = state.schedules.map((schedule) => toDate(schedule.end).getTime());
+  const minTime = Math.min(...starts);
+  const maxTime = Math.max(...ends);
+
+  const totalDays = Math.max(
+    1,
+    Math.ceil((maxTime - minTime) / (1000 * 60 * 60 * 24)) + 1,
+  );
+
+  [...state.schedules]
+    .sort((a, b) => toDate(a.start) - toDate(b.start))
+    .forEach((schedule) => {
+      const node = ganttTemplate.content.firstElementChild.cloneNode(true);
+      const label = node.querySelector(".gantt-label");
+      const bar = node.querySelector(".gantt-bar");
+
+      const offset = Math.max(
+        0,
+        Math.floor((toDate(schedule.start).getTime() - minTime) / (1000 * 60 * 60 * 24)),
+      );
+      const duration = diffDays(schedule.start, schedule.end);
+      const left = (offset / totalDays) * 100;
+      const width = Math.max(2, (duration / totalDays) * 100);
+
+      label.innerHTML = `${schedule.crop} / ${schedule.sector}<div class="meta">${schedule.start} ~ ${schedule.end}</div>`;
+      bar.style.left = `${left}%`;
+      bar.style.width = `${width}%`;
+
+      container.appendChild(node);
+    });
+}
+
+function renderGantt() {
+  buildGanttRows(ganttChart);
+}
+
+function sumByType(type) {
+  return state.inventory
+    .filter((item) => item.type === type)
+    .reduce((sum, item) => sum + Number(item.quantity), 0);
+}
+
+function renderHomeKpis() {
+  const totalTarget = state.projects.reduce((sum, project) => sum + project.target, 0);
+  const totalStock = state.projects.reduce((sum, project) => sum + project.stock, 0);
+  const totalPlanned = state.projects.reduce((sum, project) => sum + project.planned, 0);
+
+  const kpis = [
+    { title: "등록 레시피", value: `${state.recipes.length}건` },
+    { title: "재고(생산물)", value: `${sumByType("생산물")}` },
+    { title: "재고(비료)", value: `${sumByType("비료")}` },
+    { title: "프로젝트 목표/확보", value: `${totalTarget} / ${totalStock + totalPlanned}` },
+    { title: "판매 프로젝트", value: `${state.projects.length}건` },
+    { title: "생산 일정", value: `${state.schedules.length}건` },
+  ];
+
+  kpiCards.innerHTML = "";
+
+  kpis.forEach((kpi) => {
+    const card = document.createElement("div");
+    card.className = "kpi-card";
+    card.innerHTML = `<div class="kpi-title">${kpi.title}</div><div class="kpi-value">${kpi.value}</div>`;
+    kpiCards.appendChild(card);
+  });
+}
+
+function renderRecentList(target, items, formatter) {
+  target.innerHTML = "";
+
+  if (!items.length) {
+    target.innerHTML = "<li>데이터 없음</li>";
+    return;
+  }
+
+  items.slice(-3).reverse().forEach((item) => {
+    const li = document.createElement("li");
+    li.textContent = formatter(item);
+    target.appendChild(li);
+  });
+}
+
+function renderHome() {
+  renderHomeKpis();
+  buildProjectBarItems(homeBarChart);
+  buildGanttRows(homeGanttChart);
+
+  renderRecentList(
+    homeRecentRecipes,
+    state.recipes,
+    (recipe) => `${recipe.crop} · ${recipe.temp}°C / ${recipe.humidity}% / ${recipe.days}일`,
+  );
+
+  renderRecentList(
+    homeRecentInventory,
+    state.inventory,
+    (item) => `${item.name} · ${item.type} · ${item.quantity}${item.unit}`,
+  );
+
+  renderRecentList(
+    homeRecentProjects,
+    state.projects,
+    (project) => `${project.project} (${project.client}) · ${project.crop}`,
+  );
+}
+
+function rerenderAll() {
+  renderRecipes();
+  renderInventory();
+  renderProjects();
+  renderGantt();
+  renderHome();
+}
+
+tabButtons.forEach((button) => {
+  button.addEventListener("click", () => {
+    switchTab(button.dataset.tab);
+  });
+});
+
+recipeForm.addEventListener("submit", (event) => {
+  event.preventDefault();
+  state.recipes.push({
+    crop: recipeForm.elements.crop.value,
+    temp: numberValue(recipeForm, "temp"),
+    humidity: numberValue(recipeForm, "humidity"),
+    days: numberValue(recipeForm, "days"),
+    stages: recipeForm.elements.stages.value,
+  });
+  recipeForm.reset();
+  rerenderAll();
+  switchTab("home");
+});
+
+inventoryForm.addEventListener("submit", (event) => {
+  event.preventDefault();
+  state.inventory.push({
+    name: inventoryForm.elements.name.value,
+    type: inventoryForm.elements.type.value,
+    quantity: numberValue(inventoryForm, "quantity"),
+    unit: inventoryForm.elements.unit.value,
+  });
+  inventoryForm.reset();
+  rerenderAll();
+  switchTab("home");
+});
+
+projectForm.addEventListener("submit", (event) => {
+  event.preventDefault();
+  state.projects.push({
+    project: projectForm.elements.project.value,
+    client: projectForm.elements.client.value,
+    crop: projectForm.elements.crop.value,
+    target: numberValue(projectForm, "target"),
+    stock: numberValue(projectForm, "stock"),
+    planned: numberValue(projectForm, "planned"),
+  });
+  projectForm.reset();
+  rerenderAll();
+  switchTab("home");
+});
+
+scheduleForm.addEventListener("submit", (event) => {
+  event.preventDefault();
+  const start = scheduleForm.elements.start.value;
+  const end = scheduleForm.elements.end.value;
+
+  if (toDate(start) > toDate(end)) {
+    alert("종료일은 시작일보다 늦어야 합니다.");
+    return;
+  }
+
+  state.schedules.push({
+    crop: scheduleForm.elements.crop.value,
+    sector: scheduleForm.elements.sector.value,
+    start,
+    end,
+  });
+  scheduleForm.reset();
+  rerenderAll();
+  switchTab("home");
+});
+
+rerenderAll();
+switchTab("home");
