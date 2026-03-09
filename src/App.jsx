import React, { useState, useEffect } from 'react';
import Modal from './components/Modal';
import { loadData, saveData, checkDailyReset } from './utils/storage';

function App() {
  // --- СОСТОЯНИЕ (STATE) ---
  const [activeTab, setActiveTab] = useState('today'); // Навигация
  const [tasks, setTasks] = useState([]); // Список дел на сегодня
  const [habits, setHabits] = useState([]); // База привычек
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние модалки
  const [hydrated, setHydrated] = useState(false); // Данные загружены из localStorage

  // --- ЭФФЕКТЫ (EFFECTS) ---

  // 1. Загрузка данных при старте приложения
  useEffect(() => {
    const savedTasks = loadData('dailyTasks');
    const savedHabits = loadData('habits');

    // Ежедневный сброс относится только к привычкам.
    // Перед сбросом completed у привычек увеличивается countDay на 1 (если привычка была выполнена).
    const { habits: validatedHabits, lastResetDate } = checkDailyReset(savedHabits);

    setTasks(Array.isArray(savedTasks) ? savedTasks : []);
    setHabits(validatedHabits);

    // Централизованно сохраняем только здесь.
    localStorage.setItem('lastHabitsResetDate', lastResetDate);
    setHydrated(true);
  }, []);

  // 2. Синхронизация с LocalStorage при изменениях
  useEffect(() => {
    if (!hydrated) return;
    saveData('dailyTasks', tasks);
  }, [tasks, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveData('habits', habits);
  }, [habits, hydrated]);

  // --- ОБРАБОТЧИКИ (HANDLERS) ---

  const handleAddEntry = (e) => {
    e.preventDefault();
    const title = e.target.elements.title.value;
    
    if (activeTab === 'today') {
      const newTask = {
        id: Date.now(),
        title,
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTasks([...tasks, newTask]);
    } else if (activeTab === 'habits') {
      const newHabit = {
        id: Date.now(),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
        countDay: 0
      };
      setHabits([...habits, newHabit]);
    }
    
    e.target.reset(); // Очистка формы
    setIsModalOpen(false); // Закрытие окна
  };

  const toggleTaskStatus = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const toggleHabitStatus = (id) => {
    setHabits(habits.map(habit =>
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    ));
  };

  // --- РЕНДЕРИНГ (UI) ---
  return (
    <div className="app-container">
      {/* Навигация */}
      <header>
        <h1>Сегодня</h1>
      </header>

      <main>
        {/* Вкладка: СЕГОДНЯ */}
        {activeTab === 'today' && (
          <section>
            <button onClick={() => setIsModalOpen(true)}>+ Добавить задачу</button>
            <ul>
              {tasks.length === 0 && <p>Задач пока нет. Добавьте первую!</p>}
              {tasks.map(task => (
                <li key={task.id}>
                  <input 
                    type="checkbox" 
                    checked={task.completed} 
                    onChange={() => toggleTaskStatus(task.id)} 
                  />
                  <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                    {task.title}
                  </span>
                </li>
              ))}
            </ul>
            <ul>
              {habits.length === 0 && <p>Список привычек пуст.</p>}
              {habits.map(habit => (
                <li key={habit.id} className="habit-row">
                  <label className="habit-label">
                    <input
                      className="habit-checkbox"
                      type="checkbox"
                      checked={Boolean(habit.completed)}
                      onChange={() => toggleHabitStatus(habit.id)}
                    />
                    <span className={habit.completed ? 'habit-title habit-title--done' : 'habit-title'}>
                      {habit.title}
                    </span>
                  </label>
                  <span className="habit-counter">
                    Дней: {Number.isFinite(Number(habit.countDay)) ? Number(habit.countDay) : 0}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          
        )}

        {/* Вкладка: ПРИВЫЧКИ */}
        {activeTab === 'habits' && (
          <section>
            <h1>Все привычки</h1>
            <button onClick={() => setIsModalOpen(true)}>+ Создать привычку</button>
            <ul>
              {habits.length === 0 && <p>Список привычек пуст.</p>}
              {habits.map(habit => (
                <li key={habit.id} className="habit-row">
                  <label className="habit-label">
                    <input
                      className="habit-checkbox"
                      type="checkbox"
                      checked={Boolean(habit.completed)}
                      onChange={() => toggleHabitStatus(habit.id)}
                    />
                    <span className={habit.completed ? 'habit-title habit-title--done' : 'habit-title'}>
                      {habit.title}
                    </span>
                  </label>
                  <span className="habit-counter">
                    Дней: {Number.isFinite(Number(habit.countDay)) ? Number(habit.countDay) : 0}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Вкладка: КАЛЕНДАРЬ */}
        {activeTab === 'calendar' && (
          <section>
            <h1>Статистика</h1>
            <p>Здесь скоро появится календарь мониторинга прогресса.</p>
          </section>
        )}
      </main>
      <footer>
        <nav>
          <button onClick={() => setActiveTab('today')}>Сегодня</button>
          <button onClick={() => setActiveTab('habits')}>Привычки</button>
          <button onClick={() => setActiveTab('calendar')}>Календарь</button>
        </nav>
      </footer>

      {/* Модальное окно с формой (используем наш компонент) */}
      <Modal 
        isOpen={isModalOpen} 
        title={activeTab === 'today' ? 'Новая запись на сегодня' : 'Создание привычки'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleAddEntry}>
          <input 
            name="title" 
            type="text" 
            placeholder="Что планируем сделать?" 
            required 
            autoFocus
          />
          <br /><br />
          <button type="submit">Добавить</button>
        </form>
      </Modal>
    </div>
    
  );
}

export default App;