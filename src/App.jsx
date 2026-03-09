import React, { useState, useEffect } from 'react';
import Modal from './components/Modal';
import { loadData, saveData, checkDailyReset } from './utils/storage';

function App() {
  // --- СОСТОЯНИЕ (STATE) ---
  const [activeTab, setActiveTab] = useState('today');
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(true);
  const [isHabitsOpen, setIsHabitsOpen] = useState(true);

  // --- ЭФФЕКТЫ (EFFECTS) ---
  useEffect(() => {
    const savedTasks = loadData('dailyTasks');
    const savedHabits = loadData('habits');

    const { habits: validatedHabits, lastResetDate } = checkDailyReset(savedHabits);

    setTasks(Array.isArray(savedTasks) ? savedTasks : []);
    setHabits(validatedHabits);

    localStorage.setItem('lastHabitsResetDate', lastResetDate);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveData('dailyTasks', tasks);
  }, [tasks, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveData('habits', habits);
  }, [habits, hydrated]);

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
    
    e.target.reset();
    setIsModalOpen(false);
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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* КОНТЕНТ (СКРОЛЛИТСЯ) */}
      <main className="flex-1 overflow-y-auto">
        {/* Вкладка: СЕГОДНЯ */}
        {activeTab === 'today' && (
          <div>
            {/* Header ПРИКЛЕЕН К ВЕРХУ внутри скролла */}
            <header className="sticky top-0 bg-black text-white p-5 shadow-lg z-10">
              <h1 className="text-2xl font-bold tracking-tight">Сегодня</h1>
              <p className="text-sm mt-1">
                {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </p>
            </header>
            
            <div className="p-4 space-y-4 bg-black min-h-screen text-white">
              {/* Секция задач */}
              <section className="bg-zinc-900 rounded-2xl px-4 py-3">
                <button
                  type="button"
                  onClick={() => setIsTasksOpen(prev => !prev)}
                  className="w-full flex items-center justify-between"
                >
                  <span className="text-sm font-semibold tracking-wide uppercase">
                    Задачи
                  </span>
                  <span className="flex items-center space-x-2 text-zinc-400 text-sm">
                    <span>{tasks.length}</span>
                    <span className="text-lg leading-none">
                      {isTasksOpen ? '˅' : '>'}
                    </span>
                  </span>
                </button>

                {isTasksOpen && (
                  <div className="mt-3">
                    {tasks.length === 0 ? (
                      <p className="text-center text-zinc-400 py-4 text-sm">
                        Задач пока нет. Добавьте первую!
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {tasks.map(task => (
                          <li key={task.id} className="bg-zinc-800 rounded-xl p-3">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={task.completed} 
                                onChange={() => toggleTaskStatus(task.id)}
                                className="w-5 h-5 text-blue-500 rounded focus:ring-blue-400"
                              />
                              <span className={`flex-1 text-sm ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-50'}`}>
                                {task.title}
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </section>

              {/* Секция привычек */}
              <section className="bg-zinc-900 rounded-2xl px-4 py-3">
                <button
                  type="button"
                  onClick={() => setIsHabitsOpen(prev => !prev)}
                  className="w-full flex items-center justify-between"
                >
                  <span className="text-sm font-semibold tracking-wide uppercase">
                    Привычки
                  </span>
                  <span className="flex items-center space-x-2 text-zinc-400 text-sm">
                    <span>{habits.length}</span>
                    <span className="text-lg leading-none">
                      {isHabitsOpen ? '˅' : '>'}
                    </span>
                  </span>
                </button>

                {isHabitsOpen && (
                  <div className="mt-3">
                    {habits.length === 0 ? (
                      <p className="text-center text-zinc-400 py-4 text-sm">
                        Список привычек пуст.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {habits.map(habit => (
                          <li key={habit.id} className="bg-zinc-800 rounded-xl p-3 flex justify-between items-center">
                            <label className="flex items-center space-x-3 cursor-pointer flex-1">
                              <input
                                className="w-5 h-5 text-green-500 rounded focus:ring-green-400"
                                type="checkbox"
                                checked={Boolean(habit.completed)}
                                onChange={() => toggleHabitStatus(habit.id)}
                              />
                              <span className={`text-sm ${habit.completed ? 'line-through text-zinc-500' : 'text-zinc-50'}`}>
                                {habit.title}
                              </span>
                            </label>
                            <span className="text-xs bg-zinc-700 px-2 py-1 rounded-full text-zinc-200">
                              {Number.isFinite(Number(habit.countDay)) ? Number(habit.countDay) : 0} дн
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* Вкладка: ПРИВЫЧКИ */}
        {activeTab === 'habits' && (
          <div>
            <header className="sticky top-0 bg-gradient-to-r from-green-500 to-green-600 text-white p-5 shadow-lg z-10">
              <h1 className="text-2xl font-bold tracking-tight">Все привычки</h1>
            </header>
            
            <div className="p-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-xl shadow-md transition duration-200 mb-6"
              >
                + Создать привычку
              </button>
              
              {habits.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Список привычек пуст.</p>
              ) : (
                <ul className="space-y-2">
                  {habits.map(habit => (
                    <li key={habit.id} className="bg-white rounded-lg p-3 shadow-sm flex justify-between items-center">
                      <label className="flex items-center space-x-3 cursor-pointer flex-1">
                        <input
                          className="w-5 h-5 text-green-500 rounded focus:ring-green-400"
                          type="checkbox"
                          checked={Boolean(habit.completed)}
                          onChange={() => toggleHabitStatus(habit.id)}
                        />
                        <span className={`${habit.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {habit.title}
                        </span>
                      </label>
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                        {Number.isFinite(Number(habit.countDay)) ? Number(habit.countDay) : 0} дн
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Вкладка: КАЛЕНДАРЬ */}
        {activeTab === 'calendar' && (
          <div>
            <header className="sticky top-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white p-5 shadow-lg z-10">
              <h1 className="text-2xl font-bold tracking-tight">Статистика</h1>
            </header>
            
            <div className="p-4">
              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <p className="text-gray-600">Здесь скоро появится календарь мониторинга прогресса.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Плавающая кнопка создания задачи (FAB) */}
      {activeTab === 'today' && (
        <button
          type="button"
          onClick={() => {
            setIsModalOpen(true);
            setActiveTab('today');
          }}
          className="fixed right-5 bottom-20 h-14 w-14 rounded-full bg-blue-500 text-white text-3xl leading-none flex items-center justify-center shadow-xl hover:bg-blue-600 transition z-40"
        >
          +
        </button>
      )}

      {/* НИЖНЯЯ НАВИГАЦИЯ */}
      <footer className="bg-black py-2 px-4">
        <nav className="flex justify-around">
          <button 
            onClick={() => setActiveTab('today')}
            className={`py-3 px-5 rounded-full font-medium transition ${
              activeTab === 'today' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Сегодня
          </button>
          <button 
            onClick={() => setActiveTab('habits')}
            className={`py-3 px-5 rounded-full font-medium transition ${
              activeTab === 'habits' 
                ? 'bg-green-500 text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Привычки
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`py-3 px-5 rounded-full font-medium transition ${
              activeTab === 'calendar' 
                ? 'bg-purple-500 text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Календарь
          </button>
        </nav>
      </footer>

      {/* Модальное окно с формой */}
      <Modal 
        isOpen={isModalOpen} 
        title={activeTab === 'today' ? 'Новая запись на сегодня' : 'Создание привычки'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleAddEntry}>
          <input 
            name="title" 
            type="text" 
            placeholder={activeTab === 'today' ? 'Что планируем сделать?' : 'Название привычки'} 
            required 
            autoFocus
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
          />
          <button 
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition"
          >
            Добавить
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default App;