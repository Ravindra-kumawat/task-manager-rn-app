# Task Manager React Native App

A feature-rich React Native application that allows users to manage tasks and play videos with offline download and playback support. Built with modern tools like Redux Toolkit, TypeScript, and `react-native-video`.

## 🔗 GitHub Repository

[https://github.com/Ravindra-kumawat/task-manager-rn-app](https://github.com/Ravindra-kumawat/task-manager-rn-app)

---

## 🚀 Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ravindra-kumawat/task-manager-rn-app.git
   cd task-manager-rn-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Run the app**
   ```bash
   npx react-native run-android   # for Android
   npx react-native run-ios       # for iOS
   ```

---

## 🧱 Architecture & Folder Structure

```
📁TaskManagerApp
├── 📁__tests__             # Unit tests
├── 📁android               # Android native code
├── 📁ios                   # iOS native code
├── 📁patches               # Package patches
├── 📁src                   # Main source code
│   ├── 📁components        # Reusable UI components
│   ├── 📁navigation        # Navigation stack/types
│   ├── 📁screens           # All screen components
│   ├── 📁store             # Redux Toolkit store and slices
│   └── 📁utils             # Utility functions
├── App.tsx                # App entry
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
└── README.md              # Project documentation
```

---

## ✨ Features

- ✅ Task CRUD (Create, Read, Update, Delete)
- ✅ Video streaming and offline downloading
- ✅ Download progress with retry on failure
- ✅ Network detection with offline fallback modal
- ✅ Fullscreen video playback with screen orientation lock
- ✅ Persistent data with AsyncStorage
- ✅ Clean UI with `react-native-vector-icons` and responsive layout
- ✅ Code structured with Redux Toolkit & TypeScript

---

## 🧠 Design / Architecture Decisions

- **Redux Toolkit**: For scalable and maintainable state management
- **React Navigation**: For screen management
- **Offline video handling**: Used `react-native-fs` to download and store videos locally
- **Download status tracking**: `downloadProgress` managed centrally in Redux
- **Orientation handling**: Fullscreen mode triggers orientation changes via `react-native-orientation-locker`
- **Network status**: Used `@react-native-community/netinfo` to detect and handle offline mode globally
- **Reusable components**: `VideoCard`, `TaskCard`, `OfflineModal`, etc.

---

## 🔮 Future Improvements

- Add user authentication (Firebase/Auth0)
- Sync tasks/videos with cloud storage
- Add search/filter for tasks
- Add unit and e2e tests using Jest and Detox
- Integrate push notifications for reminders
- Support for multiple video resolutions or formats
- Optimize video download queue and retry logic

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙌 Author

**Ravindra Kumawat**

GitHub: [@Ravindra-kumawat](https://github.com/Ravindra-kumawat)