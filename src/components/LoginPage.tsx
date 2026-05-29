import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, User, Phone, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "../supabaseClient";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        const errMsg = error.message.toLowerCase();
        if (errMsg.includes("email not confirmed")) {
          toast.error("Please confirm your email before signing in. Check your inbox.");
        } else if (errMsg.includes("invalid login credentials") || errMsg.includes("invalid email or password") || errMsg.includes("invalid credentials")) {
          toast.error("No account found with this email. Would you like to sign up instead?");
          setIsSignUp(true);
        } else {
          toast.error(error.message || "Failed to sign in. Please try again.");
        }
      } else {
        localStorage.setItem("aroha_logged_in_persist", "true");
        localStorage.setItem("aroha_logged_in_email", email);
        toast.success(`Welcome back, ${data.user?.user_metadata?.full_name || email}!`);
        onLogin();
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone,
          },
        },
      });

      if (error) {
        const errMsg = error.message.toLowerCase();
        if (errMsg.includes("already registered") || errMsg.includes("user already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
          setIsSignUp(false);
        } else {
          toast.error(error.message || "Failed to create account. Please try again.");
        }
      } else if (data.session) {
        // Email confirmation disabled in Supabase — auto-login
        localStorage.setItem("aroha_logged_in_persist", "true");
        localStorage.setItem("aroha_logged_in_email", email);
        toast.success(`Welcome to AROHA, ${name}!`);
        onLogin();
      } else {
        // Email confirmation required — show confirmation screen (single email sent)
        setPendingEmail(email);
        setEmailConfirmationSent(true);
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin }
      });
      if (error) {
        toast.error(error.message || "Failed to initiate Google sign in.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    localStorage.setItem("aroha_logged_in_persist", "true");
    localStorage.setItem("aroha_logged_in_email", "guest@aroha.com");
    toast.success("Continuing as guest");
    onLogin();
  };

  const handleResendConfirmation = async () => {
    if (!pendingEmail) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: pendingEmail,
      });
      if (error) {
        toast.error(error.message || "Failed to resend confirmation email.");
      } else {
        toast.success("Confirmation email resent! Check your inbox.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Email confirmation screen
  if (emailConfirmationSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20 text-center">
            <div className="w-24 h-24 bg-green-500/20 border-2 border-green-400/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-12 h-12 text-green-400" />
            </div>
            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 text-sm font-semibold px-4 py-2 rounded-full mb-4 border border-green-400/30">
              <CheckCircle className="w-4 h-4" />
              Confirmation Email Sent
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Check Your Inbox</h2>
            <p className="text-white/70 text-sm mb-4">
              We sent a confirmation link to:
            </p>
            <div className="bg-white/10 border border-white/20 rounded-2xl py-3 px-5 mb-6">
              <p className="text-white font-bold text-lg break-all">{pendingEmail}</p>
            </div>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              Click the link in the email to activate your account. Once confirmed, return here and sign in with your credentials.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setEmailConfirmationSent(false);
                  setIsSignUp(false);
                  setEmail(pendingEmail);
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-base"
              >
                Go to Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                onClick={handleResendConfirmation}
                disabled={isLoading}
                variant="ghost"
                className="w-full text-white/60 hover:text-white hover:bg-white/10 text-sm"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Didn't receive it? Resend Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-56 h-56 sm:w-80 md:w-96 sm:h-80 md:h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-64 sm:h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="w-full max-w-md relative z-10 my-auto py-4 sm:py-6">
        {/* Logo and Header */}
        <div className="text-center mb-6 sm:mb-8 opacity-0 animate-[fadeIn_1.5s_ease-in-out_forwards]">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-16 h-16 sm:w-18 md:w-20 sm:h-18 md:h-20 bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl flex items-center justify-center text-4xl sm:text-4xl md:text-5xl border border-white/20 shadow-2xl transform hover:scale-110 transition-transform duration-500">
              🕉️
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                AROHA
              </h1>
              <p className="text-xs sm:text-sm text-white/90 tracking-[0.2em] sm:tracking-[0.3em] font-semibold mt-0.5 sm:mt-1">
                HERITAGE EXPLORER
              </p>
            </div>
          </div>
          <p className="text-white/80 text-sm sm:text-base md:text-lg font-light px-4">Discover the beauty of Mysuru</p>
        </div>

        {/* Login/SignUp Card */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 md:p-8 border border-white/20 opacity-0 animate-[slideUp_1.8s_ease-out_0.5s_forwards]">
          {/* Toggle Buttons */}
          <div className="flex gap-1.5 sm:gap-2 mb-5 sm:mb-6 bg-white/10 p-1 rounded-xl sm:rounded-2xl">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-500 ${
                !isSignUp
                  ? "bg-white text-purple-900 shadow-lg"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-500 ${
                isSignUp
                  ? "bg-white text-purple-900 shadow-lg"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-center text-white">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>

          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4 sm:space-y-5">
            {/* Name Input - Only for Sign Up */}
            {isSignUp && (
              <div className="opacity-0 animate-[fadeIn_0.6s_ease-in-out_forwards]">
                <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 text-white">Full Name</label>
                <div className="relative">
                  <User className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-8 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className={isSignUp ? "opacity-0 animate-[fadeIn_0.6s_ease-in-out_0.1s_forwards]" : ""}>
              <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 text-white">Email</label>
              <div className="relative">
                <Mail className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-8 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30"
                />
              </div>
            </div>

            {/* Phone Input - Only for Sign Up */}
            {isSignUp && (
              <div className="opacity-0 animate-[fadeIn_0.6s_ease-in-out_0.2s_forwards]">
                <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 text-white">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-8 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30"
                  />
                </div>
              </div>
            )}

            {/* Password Input */}
            <div className={isSignUp ? "opacity-0 animate-[fadeIn_0.6s_ease-in-out_0.3s_forwards]" : ""}>
              <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 text-white">Password</label>
              <div className="relative">
                <Lock className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-8 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30"
                />
              </div>
              {isSignUp && (
                <p className="text-xs text-white/50 mt-1">Minimum 6 characters</p>
              )}
            </div>

            {/* Confirm Password - Only for Sign Up */}
            {isSignUp && (
              <div className="opacity-0 animate-[fadeIn_0.6s_ease-in-out_0.4s_forwards]">
                <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 text-white">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-8 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30"
                  />
                </div>
              </div>
            )}

            {/* Forgot Password - Only for Sign In */}
            {!isSignUp && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => toast.info("Password reset functionality coming soon!")}
                  className="text-xs sm:text-sm text-white/80 hover:text-white hover:underline transition-all duration-300"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/30"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-3 sm:px-4 bg-gradient-to-r from-transparent via-purple-900 to-transparent text-white/70 font-medium">
                OR
              </span>
            </div>
          </div>

          {/* Google & Guest Login */}
          <div className="space-y-3">
            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold bg-white text-purple-950 hover:bg-gray-100 transition-all duration-500 transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </Button>

            <Button
              type="button"
              onClick={handleGuestLogin}
              disabled={isLoading}
              className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold bg-white/20 hover:bg-white/30 text-white border border-white/40 backdrop-blur-sm transition-all duration-500 transform hover:scale-105"
            >
              Continue as Guest
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-5 sm:mt-6 space-y-1.5 sm:space-y-2 opacity-0 animate-[fadeIn_1s_ease-in-out_1s_forwards] px-4">
          <p className="text-white/80 text-xs sm:text-sm font-light">
            Explore Mysuru's rich heritage and culture
          </p>
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
