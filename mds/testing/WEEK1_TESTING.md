# Week 1 Testing Plan - Environment Setup & Foundation

**Module:** Backend & Frontend Setup  
**Test Date:** TBD  
**Tester:** [Your Name]  
**Status:** ⏳ Pending

---

## 📋 Pre-Testing Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend dev server running on port 5173
- [ ] MySQL database server running (port 3306)
- [ ] `.env` files configured correctly
- [ ] All dependencies installed (npm install completed)
- [ ] Git repository initialized

---

## 🔧 Backend Testing

### BT-01: Server Startup

**Objective:** Verify backend server starts without errors

**Test Steps:**

1. Navigate to `hasal-pos-backend` directory
2. Run `npm start` or `npm run dev`
3. Check terminal output

**Expected Results:**

- ✅ Server starts successfully
- ✅ Console shows "Server running on port 5000"
- ✅ Database connection successful message displayed
- ✅ No error messages in console

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### BT-02: Environment Configuration

**Objective:** Verify environment variables are loaded correctly

**Test Steps:**

1. Check `.env` file exists in backend root
2. Verify all required variables are present:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `DB_DIALECT`
   - `JWT_SECRET`
   - `PORT`
3. Start server and check config loading

**Expected Results:**

- ✅ All environment variables present
- ✅ Server uses correct port from .env
- ✅ Database connection uses correct credentials

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### BT-03: Database Connection

**Objective:** Verify Sequelize connects to MySQL successfully

**Test Steps:**

1. Start backend server
2. Check console for database connection messages
3. Try accessing any endpoint (e.g., health check)

**Expected Results:**

- ✅ "Database connected successfully" message shown
- ✅ No connection errors
- ✅ Sequelize authenticates with MySQL

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### BT-04: CORS Configuration

**Objective:** Verify CORS is configured to allow frontend requests

**Test Steps:**

1. Start backend server
2. Check CORS middleware in `app.js`
3. Verify origin allows `http://localhost:5173`

**Expected Results:**

- ✅ CORS middleware configured
- ✅ Frontend origin allowed
- ✅ Credentials enabled

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### BT-05: Error Handling Middleware

**Objective:** Verify global error handler catches errors

**Test Steps:**

1. Check `middleware/errorHandler.js` exists
2. Verify error handler registered in `app.js`
3. Test by accessing non-existent endpoint

**Expected Results:**

- ✅ Error handler middleware present
- ✅ Returns proper error response format
- ✅ Includes error message and status code

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### BT-06: Folder Structure

**Objective:** Verify all required backend folders exist

**Test Steps:**

1. Check the following directories exist:
   - `controllers/`
   - `models/`
   - `routes/`
   - `middleware/`
   - `utils/`
   - `config/`
   - `migrations/`
   - `scripts/`

**Expected Results:**

- ✅ All directories present
- ✅ Proper organization

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

## 🎨 Frontend Testing

### FT-01: Development Server Startup

**Objective:** Verify frontend dev server starts successfully

**Test Steps:**

1. Navigate to project root (where package.json is)
2. Run `npm run dev`
3. Check terminal output
4. Open browser to `http://localhost:5173`

**Expected Results:**

- ✅ Vite dev server starts
- ✅ Console shows "Local: http://localhost:5173"
- ✅ No compilation errors
- ✅ Browser displays application

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### FT-02: PrimeVue Configuration

**Objective:** Verify PrimeVue is installed and configured

**Test Steps:**

1. Check `main.js` for PrimeVue imports
2. Verify theme CSS imported
3. Check PrimeIcons CSS imported
4. Try using a PrimeVue component (e.g., Button)

**Expected Results:**

- ✅ PrimeVue plugin registered
- ✅ Theme CSS loaded
- ✅ Icons display correctly
- ✅ Components render properly

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### FT-03: Vue Router Configuration

**Objective:** Verify routing is set up correctly

**Test Steps:**

1. Check `router/index.js` exists
2. Verify routes are defined
3. Test navigation to different routes
4. Check for 404 page on invalid route

**Expected Results:**

- ✅ Router configured
- ✅ Routes navigate correctly
- ✅ NotFound page shows for invalid routes

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### FT-04: Pinia Store Configuration

**Objective:** Verify Pinia state management is configured

**Test Steps:**

1. Check Pinia is registered in `main.js`
2. Verify `stores/` folder exists
3. Try creating a test store and accessing state

**Expected Results:**

- ✅ Pinia configured
- ✅ Stores can be created
- ✅ State management works

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### FT-05: Axios Configuration

**Objective:** Verify API service is configured correctly

**Test Steps:**

1. Check `services/api.js` exists
2. Verify baseURL points to `http://localhost:5000/api`
3. Check interceptors are configured
4. Verify Vite proxy is configured (check vite.config.js)

**Expected Results:**

- ✅ Axios instance created
- ✅ Base URL correct
- ✅ Request/response interceptors present
- ✅ Proxy configured for /api routes

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### FT-06: Layout Components

**Objective:** Verify layout components are created

**Test Steps:**

1. Check the following files exist:
   - `components/layout/AppLayout.vue`
   - `components/layout/Sidebar.vue`
   - `components/layout/Topbar.vue`
2. Verify components render without errors

**Expected Results:**

- ✅ All layout components present
- ✅ Components render correctly
- ✅ No console errors

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### FT-07: Folder Structure

**Objective:** Verify all required frontend folders exist

**Test Steps:**

1. Check the following directories exist:
   - `src/views/`
   - `src/components/`
   - `src/stores/`
   - `src/services/`
   - `src/utils/`
   - `src/composables/`
   - `src/router/`
   - `src/assets/`

**Expected Results:**

- ✅ All directories present
- ✅ Proper organization

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### FT-08: Environment Variables

**Objective:** Verify frontend environment configuration

**Test Steps:**

1. Check `.env` file exists
2. Verify VITE_API_URL is set
3. Access env variable in code using `import.meta.env`

**Expected Results:**

- ✅ `.env` file present
- ✅ Variables accessible via import.meta.env
- ✅ API URL points to backend

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

## 🔗 Integration Testing

### IT-01: Frontend-Backend Communication

**Objective:** Verify frontend can communicate with backend

**Test Steps:**

1. Start both backend (port 5000) and frontend (port 5173)
2. Open browser console
3. Check Network tab for any API calls
4. Verify no CORS errors

**Expected Results:**

- ✅ Both servers running
- ✅ No CORS errors in console
- ✅ API requests can be made (even if they return 404 for now)

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### IT-02: Hot Module Replacement (HMR)

**Objective:** Verify Vite HMR works for development

**Test Steps:**

1. Start frontend dev server
2. Open browser to localhost:5173
3. Make a small change to a Vue component
4. Save file

**Expected Results:**

- ✅ Changes reflect in browser immediately
- ✅ No full page reload (HMR working)
- ✅ State preserved

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

## 📊 Test Summary

### Backend Tests

- Total Tests: 6
- Passed: \_\_\_
- Failed: \_\_\_
- Pass Rate: \_\_\_%

### Frontend Tests

- Total Tests: 8
- Passed: \_\_\_
- Failed: \_\_\_
- Pass Rate: \_\_\_%

### Integration Tests

- Total Tests: 2
- Passed: \_\_\_
- Failed: \_\_\_
- Pass Rate: \_\_\_%

### Overall

- **Total Tests:** 16
- **Passed:** \_\_\_
- **Failed:** \_\_\_
- **Pass Rate:** \_\_\_%

---

## 🐛 Issues Found

| ID  | Severity | Description | Status | Notes |
| --- | -------- | ----------- | ------ | ----- |
| 1   |          |             |        |       |
| 2   |          |             |        |       |
| 3   |          |             |        |       |

**Severity Levels:** Critical, High, Medium, Low

---

## ✅ Sign-off

**Tested By:** ******\_\_\_******  
**Date:** ******\_\_\_******  
**Status:** ⏳ Pending / ✅ Approved / ❌ Rejected  
**Notes:**

---

## 📝 Additional Notes

_Add any additional observations, recommendations, or comments here._
