const todoForm = document.getElementById("todoForm");
const todoList = document.getElementById("todoList");
const searchTodo = document.getElementById("searchTodo");
const filterCheckboxes = document.querySelectorAll(".filter-checkbox");
const sortRadios = document.querySelectorAll(".sort-radio");

// Utility functions
function getTodos() {
  return JSON.parse(localStorage.getItem("todos")) || [];
}

function saveTodos(todos) {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function updateOverdueStatus() {
  const todos = getTodos();
  const now = new Date();

  todos.forEach(todo => {
    const todoDate = new Date(`${todo.date}T${todo.time}`);
    if (todoDate < now && todo.status === "Pending") {
      todo.status = "Overdue";
    }
  });

  saveTodos(todos);
}

function renderTodos(filterFn = () => true) {
  updateOverdueStatus();

  let todos = getTodos();

  // Apply Filters
  const activeFilters = Array.from(filterCheckboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.dataset.filter);

  if (activeFilters.length > 0) {
    todos = todos.filter(todo => {
      return activeFilters.some(filter => {
        return todo.status === filter || todo.priority === filter;
      });
    });
  }

  // Apply Search Filter
  todos = todos.filter(filterFn);

  const activeSort = Array.from(sortRadios).find(radio => radio.checked)?.value;
  if (activeSort) {
    todos.sort((a, b) => {
      if (activeSort === "time") {
        // Sort by date and time
        return new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`);
      }
  
      if (activeSort === "priority") {
        // Sort by priority: Urgent → Normal → Not Urgent
        const priorityOrder = { "urgent": 1, "normal": 2, "not urgent": 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
  
      if (activeSort === "status") {
        // Sort by status: Overdue → Pending → Completed
        const statusOrder = { "Overdue": 1, "Pending": 2, "Completed": 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
  
      // Default: Sort alphabetically by description
      return a.description.localeCompare(b.description);
    });
  }  

  // Render
  todoList.innerHTML = todos.map((todo, index) => `
    <div class="col-md-4">
        <div class="card">
          <div class="card-header text-white ${todo.status === "Completed" ? "bg-success" : todo.status === "Overdue" ? "bg-danger" : "bg-warning"}">
          ${todo.status}
          </div>
          <div class="card-body">
            <h5 class="card-title">${todo.description}</h5>
            <p class="card-text">
              ${todo.date} ${todo.time}<br>
              Priority: ${todo.priority}
            </p>
            <button class="btn btn-success btn-sm me-2" onclick="toggleStatus(${index})">✔</button>
            <button class="btn btn-danger btn-sm" onclick="deleteTodo(${index})">🗑</button>
          </div>
        </div>
      </div>
    `).join("");
}

// Event Listeners
searchTodo.addEventListener("input", () => renderTodos());
filterCheckboxes.forEach(checkbox => checkbox.addEventListener("change", () => renderTodos()));
sortRadios.forEach(radio => radio.addEventListener("change", () => renderTodos()));

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const description = document.getElementById("todoDescription").value;
  const date = document.getElementById("todoDate").value;
  const time = document.getElementById("todoTime").value;
  const priority = document.getElementById("todoPriority").value;

  const newTodo = { description, date, time, priority, status: "Pending" };
  const todos = getTodos();
  todos.push(newTodo);
  saveTodos(todos);

  clearModalInputs();

  const modal = bootstrap.Modal.getInstance(document.getElementById("addTodoModal"));
  modal.hide();
  renderTodos();
});

// Fungsi untuk clear input
function clearModalInputs() {
  document.getElementById("todoDescription").value = "";
  document.getElementById("todoDate").value = "";
  document.getElementById("todoTime").value = "";
  document.getElementById("todoPriority").value = "Normal"; // Reset ke default value
}

// Toggle Status
function toggleStatus(index) {
  const todos = getTodos();
  todos[index].status = todos[index].status === "Completed" ? "Pending" : "Completed";
  saveTodos(todos);
  renderTodos();
}

// Delete Todo
function deleteTodo(index) {
  const todos = getTodos();
  todos.splice(index, 1);
  saveTodos(todos);
  renderTodos();
}

searchTodo.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  renderTodos(todo => todo.description.toLowerCase().includes(query));
});

// Initial Render
renderTodos();
