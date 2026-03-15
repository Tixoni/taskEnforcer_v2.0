import React, { useState, useEffect } from 'react';
import Modal from './components/Modal';
import EditItemModal from './components/EditItemModal';
import SectionCard from './components/SectionCard';
import TaskItem from './components/TaskItem';
import HabitItem from './components/HabitItem';
import NavButton from './components/NavButton';
import CalendarDay from './components/CalendarDay';
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
  const [selectedDateKey, setSelectedDateKey] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [calendarSwipeStartX, setCalendarSwipeStartX] = useState(null);
  const [calendarSlideDir, setCalendarSlideDir] = useState(0); // -1 left, 1 right

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
    
    if (activeTab === 'today' || activeTab === 'calendar') {
      const baseDate =
        activeTab === 'today' ? new Date() : new Date(selectedDateKey);
      const newTask = {
        id: Date.now(),
        title,
        completed: false,
        createdAt: baseDate.toISOString(),
        completedAt: null,
      };
      setTasks([...tasks, newTask]);
    } else if (activeTab === 'habits') {
      const newHabit = {
        id: Date.now(),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
        countDay: 0,
        completedAt: null,
      };
      setHabits([...habits, newHabit]);
    }
    
    e.target.reset();
    setIsModalOpen(false);
  };

  const toggleTaskStatus = (id) => {
    const todayKey = new Date().toISOString().split('T')[0];
    setTasks(tasks.map(task => {
      if (task.id !== id) return task;
      const nextCompleted = !task.completed;
      return {
        ...task,
        completed: nextCompleted,
        completedAt: nextCompleted ? todayKey : null,
      };
    }));
  };

  const toggleHabitStatus = (id) => {
    const todayKey = new Date().toISOString().split('T')[0];
    setHabits(habits.map(habit => {
      if (habit.id !== id) return habit;
      const nextCompleted = !habit.completed;
      return {
        ...habit,
        completed: nextCompleted,
        completedAt: nextCompleted ? todayKey : null,
      };
    }));
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

  const getDateKey = (value) => {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  };

  // Разделяем задачи на активные и выполненные
  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const selectedDate = new Date(selectedDateKey);
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth(); // 0-11

  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastOfMonth.getDate();

  // Начинаем неделю с понедельника
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // 0 = Monday

  const calendarCells = [];
  const prevMonthLastDate = new Date(year, month, 0).getDate();

  // Дни предыдущего месяца
  for (let i = firstWeekday - 1; i >= 0; i -= 1) {
    const day = prevMonthLastDate - i;
    calendarCells.push({
      date: new Date(year, month - 1, day),
      isOtherMonth: true,
    });
  }

  // Текущий месяц
  for (let day = 1; day <= daysInMonth; day += 1) {
    calendarCells.push({
      date: new Date(year, month, day),
      isOtherMonth: false,
    });
  }

  // Дни следующего месяца до заполнения сетки (6 недель максимум)
  const nextMonthStart = new Date(year, month + 1, 1);
  let nextDay = 1;
  while (calendarCells.length % 7 !== 0 || calendarCells.length < 42) {
    calendarCells.push({
      date: new Date(nextMonthStart.getFullYear(), nextMonthStart.getMonth(), nextDay),
      isOtherMonth: true,
    });
    nextDay += 1;
  }

  const todayKey = getDateKey(new Date());

  const hasPendingForDay = (dateKey) => {
    if (!dateKey) return false;
    const hasTask = tasks.some(
      (t) => !t.completed && getDateKey(t.createdAt) === dateKey,
    );
    const hasHabit = habits.some(
      (h) => !h.completed && getDateKey(h.createdAt) === dateKey,
    );
    return hasTask || hasHabit;
  };

  const tasksForSelectedDay = tasks.filter(
    (t) => getDateKey(t.createdAt) === selectedDateKey,
  );
  const habitsForSelectedDay = habits.filter(
    (h) => getDateKey(h.createdAt) === selectedDateKey,
  );

  const changeMonth = (offset) => {
    const d = new Date(selectedDateKey);
    d.setMonth(d.getMonth() + offset);
    setSelectedDateKey(getDateKey(d));
    setCalendarSlideDir(offset > 0 ? 1 : -1);
    setTimeout(() => setCalendarSlideDir(0), 260);
  };

  const handleCalendarTouchStart = (event) => {
    if (event.touches && event.touches.length > 0) {
      setCalendarSwipeStartX(event.touches[0].clientX);
    }
  };

  const handleCalendarTouchEnd = (event) => {
    if (calendarSwipeStartX == null) return;
    const endX = event.changedTouches[0].clientX;
    const deltaX = endX - calendarSwipeStartX;
    const threshold = 50;
    if (deltaX > threshold) {
      // свайп вправо -> предыдущий месяц
      changeMonth(-1);
    } else if (deltaX < -threshold) {
      // свайп влево -> следующий месяц
      changeMonth(1);
    }
    setCalendarSwipeStartX(null);
  };

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
            {/* Header ПРИКЛЕЕН К ВЕРХУ внутри скролла */}
            <header className="sticky top-0 bg-black text-white p-5 shadow-lg z-10">
              <h1 className="text-2xl font-bold tracking-tight">Привычки</h1>
              <p className={`text-sm mt-1 ${THEME_COLORS.dateTextPrimary}`}>
                {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </p>
            </header>
            
            <div className="p-4 space-y-4 bg-black min-h-screen text-white">
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

        {/* Вкладка: КАЛЕНДАРЬ */}
        {activeTab === 'calendar' && (
          <div className="min-h-screen bg-black text-white">
            <header className="sticky top-0 bg-black p-5 shadow-lg z-10 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {selectedDate.toLocaleDateString('ru-RU', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h1>
                <p className={`text-sm mt-1 ${THEME_COLORS.dateTextPrimary}`}>
                  {selectedDate.toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </header>

            <div
              className={`p-4 space-y-6 ${
                calendarSlideDir === 1
                  ? 'calendar-slide-left'
                  : calendarSlideDir === -1
                    ? 'calendar-slide-right'
                    : ''
              }`}
              onTouchStart={handleCalendarTouchStart}
              onTouchEnd={handleCalendarTouchEnd}
            >
              {/* Календарная сетка */}
              <div className="rounded-2xl bg-zinc-900 p-4">
                <div className="grid grid-cols-7 text-center text-xs text-zinc-500 mb-2">
                  <span>Пн</span>
                  <span>Вт</span>
                  <span>Ср</span>
                  <span>Чт</span>
                  <span>Пт</span>
                  <span>Сб</span>
                  <span>Вс</span>
                </div>
                <div className="grid grid-cols-7 gap-y-2">
                  {calendarCells.map((cell, idx) => {
                    const { date, isOtherMonth } = cell;
                    const key = getDateKey(date);
                    return (
                      <CalendarDay
                        key={key}
                        date={date}
                        isToday={key === todayKey}
                        isSelected={key === selectedDateKey}
                        isOtherMonth={isOtherMonth}
                        hasPending={hasPendingForDay(key)}
                        onSelect={(d) => setSelectedDateKey(getDateKey(d))}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Списки задач и привычек на выбранный день */}
              <SectionCard
                title="Задачи дня"
                count={tasksForSelectedDay.length}
                isOpen
                onToggle={() => {}}
                items={tasksForSelectedDay}
                renderItem={(task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTaskStatus}
                    onOpenDetails={openEditTask}
                  />
                )}
              />

              <SectionCard
                title="Привычки дня"
                count={habitsForSelectedDay.length}
                isOpen
                onToggle={() => {}}
                items={habitsForSelectedDay}
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
      </main>

      {/* Плавающая кнопка создания задачи (FAB) */}
      {(activeTab === 'today' || activeTab === 'calendar') && (
        <button
          type="button"
          onClick={() => {
            setIsModalOpen(true);
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