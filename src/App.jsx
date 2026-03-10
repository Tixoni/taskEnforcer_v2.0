import React, { useState, useEffect } from 'react';
import Modal from './components/Modal';
import EditItemModal from './components/EditItemModal';
import SectionCard from './components/SectionCard';
import TaskItem from './components/TaskItem';
import HabitItem from './components/HabitItem';
import NavButton from './components/NavButton';
import { THEME_COLORS } from './theme';
import { loadData, saveData, checkDailyReset } from './utils/storage';

function App() {
  // --- СОСТОЯНИЕ (STATE) ---
  const [activeTab, setActiveTab] = useState('today');
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(true);
  const [isCompletedOpen, setIsCompletedOpen] = useState(true);
  const [isHabitsOpen, setIsHabitsOpen] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState(null); // 'task' | 'habit'

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

  const openEditTask = (task) => {
    setEditingItem(task);
    setEditingType('task');
  };

  const openEditHabit = (habit) => {
    setEditingItem(habit);
    setEditingType('habit');
  };

  const closeEditModal = () => {
    setEditingItem(null);
    setEditingType(null);
  };

  const handleSaveItem = (id, newTitle, type) => {
    if (type === 'task') {
      setTasks(prev =>
        prev.map((t) => (t.id === id ? { ...t, title: newTitle } : t)),
      );
    } else if (type === 'habit') {
      setHabits(prev =>
        prev.map((h) => (h.id === id ? { ...h, title: newTitle } : h)),
      );
    }
    closeEditModal();
  };

  const handleDeleteItem = (id, type) => {
    if (type === 'task') {
      setTasks(prev => prev.filter((t) => t.id !== id));
    } else if (type === 'habit') {
      setHabits(prev => prev.filter((h) => h.id !== id));
    }
    closeEditModal();
  };

  // Разделяем задачи на активные и выполненные
  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  // --- РЕНДЕРИНГ (UI) ---
  return (
    <div className={`h-screen flex flex-col ${THEME_COLORS.background}`}>
      {/* КОНТЕНТ (СКРОЛЛИТСЯ) */}
      <main className="flex-1 overflow-y-auto">
        {/* Вкладка: СЕГОДНЯ */}
        {activeTab === 'today' && (
          <div>
            {/* Header ПРИКЛЕЕН К ВЕРХУ внутри скролла */}
            <header className="sticky top-0 bg-black text-white p-5 shadow-lg z-10">
              <h1 className="text-2xl font-bold tracking-tight">Сегодня</h1>
              <p className={`text-sm mt-1 ${THEME_COLORS.dateTextPrimary}`}>
                {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </p>
            </header>
            
            <div className="p-4 space-y-4 bg-black min-h-screen text-white">
              {/* Секция задач */}
              <SectionCard
                title="Задачи"
                count={activeTasks.length}
                isOpen={isTasksOpen}
                onToggle={() => setIsTasksOpen(prev => !prev)}
                items={activeTasks}
                renderItem={(task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTaskStatus}
                    onOpenDetails={openEditTask}
                  />
                )}
              />

              {/* Секция выполненных задач */}
              <SectionCard
                title="Выполнено"
                count={completedTasks.length}
                isOpen={isCompletedOpen}
                onToggle={() => setIsCompletedOpen(prev => !prev)}
                items={completedTasks}
                renderItem={(task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTaskStatus}
                    onOpenDetails={openEditTask}
                  />
                )}
              />

              {/* Секция привычек */}
              <SectionCard
                title="Привычки"
                count={habits.length}
                isOpen={isHabitsOpen}
                onToggle={() => setIsHabitsOpen(prev => !prev)}
                items={habits}
                emptyText="Список привычек пуст."
                renderItem={(habit) => (
                  <HabitItem
                    key={habit.id}
                    habit={habit}
                    onToggle={toggleHabitStatus}
                    onOpenDetails={openEditHabit}
                  />
                )}
              />
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
          className={`fixed right-5 bottom-20 h-14 w-14 rounded-full text-white text-3xl flex items-center justify-center shadow-xl transition z-40 border-0 outline-none ring-0 ${THEME_COLORS.accentBg} ${THEME_COLORS.accentBgHover}`}
        >
          +
        </button>
      )}

      {/* НИЖНЯЯ НАВИГАЦИЯ */}
      <footer className="bg-black py-2 px-4">
        <nav className="flex justify-around">
          <NavButton
            label="Сегодня"
            isActive={activeTab === 'today'}
            onClick={() => setActiveTab('today')}
          />
          <NavButton
            label="Привычки"
            isActive={activeTab === 'habits'}
            onClick={() => setActiveTab('habits')}
          />
          <NavButton
            label="Календарь"
            isActive={activeTab === 'calendar'}
            onClick={() => setActiveTab('calendar')}
          />
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
            className="w-full p-3 rounded-lg focus:outline-none  mb-2 "
          />
        </form>
      </Modal>

      <EditItemModal
        isOpen={Boolean(editingItem)}
        item={editingItem}
        type={editingType}
        onClose={closeEditModal}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
      />
    </div>
  );
}

export default App;