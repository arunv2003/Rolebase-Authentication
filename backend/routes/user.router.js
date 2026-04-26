import express from "express"
import { adminController, loginUser, logout, myProfile, refreshCsrf, refreshToken, registerUser, resendOTP, verifyEmail, verifyOTP } from "../controller/user.controller.js"
import isAuth, { authorizedAdmin } from "../middlewares/isAuth.js"
import { validateCSRFToken } from "../middlewares/csrfToken.js"

const router = express.Router()

router.route('/register').post(registerUser)
router.route('/verify-email').get(verifyEmail)


router.route('/login').post(loginUser)
router.route('/verify-login-otp').post(verifyOTP)
router.route('/resend-otp').post(resendOTP)

router.route('/my-profile').get(isAuth,myProfile)

router.route('/refresh').post(refreshToken)

router.route('/logout').post(isAuth,validateCSRFToken ,logout)

router.route('/refresh-csrf').post(isAuth,refreshCsrf)

router.route('/admin').get(isAuth,authorizedAdmin ,adminController)



export default router