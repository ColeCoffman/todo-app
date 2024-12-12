"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getCategories,
} from "@/lib/actions";
import { CreateCategoryDialog } from "./components/CreateCategoryDialog";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  category_id?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

export default function Dashboard() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      const [tasksData, categoriesData] = await Promise.all([
        getTasks(),
        getCategories(),
      ]);
      if (tasksData) setTodos(tasksData);
      if (categoriesData) setCategories(categoriesData);
    };
    loadData();
  }, []);

  const handleAddTodo = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTodo.trim()) {
      const task = await createTask(
        newTodo.trim(),
        selectedCategory || undefined
      );
      if (task) {
        setTodos([task, ...todos]);
        setNewTodo("");
      }
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      const updatedTask = await updateTask(id, { completed: !todo.completed });
      if (updatedTask) {
        setTodos(todos.map((t) => (t.id === id ? updatedTask : t)));
      }
    }
  };

  const handleDeleteTask = async (id: string) => {
    const success = await deleteTask(id);
    if (success) {
      setTodos(todos.filter((t) => t.id !== id));
    }
  };

  const filteredTodos = selectedCategory
    ? todos.filter((todo) => todo.category_id === selectedCategory)
    : todos;

  const refreshCategories = async () => {
    const categoriesData = await getCategories();
    if (categoriesData) setCategories(categoriesData);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Categories
          </h2>
          <CreateCategoryDialog onCategoryCreated={refreshCategories} />
          <Button
            variant="outline"
            className="w-full justify-start gap-2 mt-2"
            onClick={() => setSelectedCategory(null)}
          >
            <PlusCircle className="h-4 w-4" />
            All Tasks
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              className={`w-full justify-start mt-2 ${
                selectedCategory === category.id ? "bg-gray-100" : ""
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name +
                  " Tasks"
                : "All Tasks"}
            </h1>
            <Input
              placeholder="Add a new todo..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={handleAddTodo}
              className="w-full"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Task</TableHead>
                <TableHead className="w-[150px]">Category</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTodos.map((todo) => (
                <TableRow key={todo.id}>
                  <TableCell>
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                    />
                  </TableCell>
                  <TableCell
                    className={
                      todo.completed ? "line-through text-muted-foreground" : ""
                    }
                  >
                    {todo.text}
                  </TableCell>
                  <TableCell>
                    {todo.category_id && (
                      <div className="flex items-center">
                        <div
                          className="w-2 h-2 rounded-full mr-2"
                          style={{
                            backgroundColor: categories.find(
                              (c) => c.id === todo.category_id
                            )?.color,
                          }}
                        />
                        {
                          categories.find((c) => c.id === todo.category_id)
                            ?.name
                        }
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(todo.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
