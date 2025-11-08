import { useState, useEffect } from "react";
import {
  Calendar,
  Activity,
  Utensils,
  Footprints,
  Plus,
  LogOut,
  User,
  Trash2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState("");
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState("login");
  const [activities, setActivities] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [activityForm, setActivityForm] = useState({
    activity_type: "workout",
    title: "",
    description: "",
    status: "planned",
    duration_minutes: "",
    calories: "",
    steps_count: 1222,
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
      fetchActivities(savedToken);
    }
  }, []);

  const showMessage = (msg: any, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(""), 5000);
    } else {
      setSuccess(msg);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        showMessage("Login successful!");
        fetchActivities(data.token);
      } else {
        showMessage(data.error || "Login failed", true);
      }
    } catch (err) {
      showMessage("Network error. Make sure Django backend is running!", true);
    }
    setLoading(false);
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });
      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        showMessage("Registration successful!");
        fetchActivities(data.token);
      } else {
        showMessage(Object.values(data)[0] || "Registration failed", true);
      }
    } catch (err) {
      showMessage("Network error. Make sure Django backend is running!", true);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout/`, {
        method: "POST",
        headers: { Authorization: `Token ${token}` },
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
    setIsLoggedIn(false);
    setToken("");
    setUser(null);
    setActivities([]);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showMessage("Logged out successfully");
  };

  const fetchActivities = async (authToken: any) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/activities/`, {
        headers: { Authorization: `Token ${authToken || token}` },
      });
      const data = await response.json();
      setActivities(data.results || data);
    } catch (err) {
      showMessage("Failed to fetch activities", true);
    }
    setLoading(false);
  };

  const handleCreateActivity = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/activities/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(activityForm),
      });

      if (response.ok) {
        showMessage("Activity created successfully!");
        setActivityForm({
          activity_type: "workout",
          title: "",
          description: "",
          status: "planned",
          duration_minutes: "",
          calories: "",
          steps_count: 1222,
          date: new Date().toISOString().split("T")[0],
        });
        // fetchActivities();
      } else {
        showMessage("Failed to create activity", true);
      }
    } catch (err) {
      showMessage("Network error", true);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id: any, newStatus: any) => {
    try {
      const response = await fetch(`${API_URL}/activities/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        showMessage("Status updated!");
        //fetchActivities();
      }
    } catch (err) {
      showMessage("Update failed", true);
    }
  };

  const handleDeleteActivity = async (id: any) => {
    if (!window.confirm("Delete this activity?")) return;

    try {
      const response = await fetch(`${API_URL}/activities/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });

      if (response.ok || response.status === 204) {
        showMessage("Activity deleted!");
        //fetchActivities();
      }
    } catch (err) {
      showMessage("Delete failed", true);
    }
  };

  const getActivityIcon = (type: any) => {
    switch (type) {
      case "workout":
        return <Activity className="w-5 h-5" />;
      case "meal":
        return <Utensils className="w-5 h-5" />;
      case "steps":
        return <Footprints className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case "planned":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <Activity className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">
              Fitness Tracker
            </h1>
            <p className="text-gray-600 mt-2">
              Track your fitness journies.....
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <div className="flex mb-6 border-b">
            <button
              onClick={() => setView("login")}
              className={`flex-1 py-2 font-semibold ${
                view === "login"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setView("register")}
              className={`flex-1 py-2 font-semibold ${
                view === "register"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500"
              }`}
            >
              Register
            </button>
          </div>

          {view === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, username: e.target.value })
                }
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? "Loading..." : "Login"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                value={registerForm.username}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, username: e.target.value })
                }
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, email: e.target.value })
                }
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                  value={registerForm.first_name}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      first_name: e.target.value,
                    })
                  }
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                  value={registerForm.last_name}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      last_name: e.target.value,
                    })
                  }
                />
              </div>
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, password: e.target.value })
                }
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? "Loading..." : "Register"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Fitness Tracker
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="w-5 h-5" />
                <span className="font-medium">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Add New Activity
              </h2>
              <form onSubmit={handleCreateActivity} className="space-y-4">
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                  value={activityForm.activity_type}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      activity_type: e.target.value,
                    })
                  }
                >
                  <option value="workout">Workout</option>
                  <option value="meal">Meal</option>
                  <option value="steps">Steps</option>
                </select>

                <input
                  type="text"
                  placeholder="Title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                  value={activityForm.title}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, title: e.target.value })
                  }
                  required
                />

                <textarea
                  placeholder="Description (optional)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                  value={activityForm.description}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      description: e.target.value,
                    })
                  }
                  //rows="3"
                />

                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                  value={activityForm.status}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, status: e.target.value })
                  }
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                  value={activityForm.date}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, date: e.target.value })
                  }
                />

                {activityForm.activity_type !== "steps" && (
                  <input
                    type="number"
                    placeholder="Duration (minutes)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                    value={activityForm.duration_minutes}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        duration_minutes: e.target.value,
                      })
                    }
                  />
                )}

                <input
                  type="number"
                  placeholder="Calories"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                  value={activityForm.calories}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      calories: e.target.value,
                    })
                  }
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add Activity"}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                My Activities
              </h2>

              {loading && activities.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Loading activities...
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No activities yet. Add your first activity!
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity: any) => (
                    <div
                      key={activity.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="mt-1 text-indigo-600">
                            {getActivityIcon(activity.activity_type)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {activity.title}
                            </h3>
                            {activity.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {activity.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {activity.date}
                              </span>
                              {activity.duration_minutes && (
                                <span>• {activity.duration_minutes} min</span>
                              )}
                              {activity.calories && (
                                <span>• {activity.calories} cal</span>
                              )}
                              {activity.steps_count && (
                                <span>• {activity.steps_count} steps</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              activity.status
                            )}`}
                          >
                            {activity.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() =>
                            handleUpdateStatus(activity.id, "planned")
                          }
                          disabled={activity.status === "planned"}
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm hover:bg-yellow-200 transition disabled:opacity-50"
                        >
                          Planned
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateStatus(activity.id, "in_progress")
                          }
                          disabled={activity.status === "in_progress"}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition disabled:opacity-50"
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateStatus(activity.id, "completed")
                          }
                          disabled={activity.status === "completed"}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200 transition disabled:opacity-50"
                        >
                          Completed
                        </button>
                        <div className="flex-1"></div>
                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200 transition flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
