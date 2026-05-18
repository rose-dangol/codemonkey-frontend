import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { LoginUser } from "@/services/Authenticate";
import { Label } from "@radix-ui/react-label";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";

const Login = () => {
  const navigate = useNavigate();
  const { onLoginSuccess } = useAuth();

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Username is required."),
      password: Yup.string().required("Password is required."),
    }),
    onSubmit: async (values) => {
      try {
        const data = await LoginUser({
          username: values.username,
          password: values.password,
        });
        onLoginSuccess(data.accessToken);
        navigate("/home");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast.error("Login Failed.");
        console.error(error.status, error.message);
      }
    },
  });

  return (
    <div className="flex justify-center items-center h-screen bg-[#212121]">
      <Card className="w-full max-w-md bg-[#2C2C2C] border-0 text-white rounded-xl">
        <CardHeader>
          <CardTitle className="text-[#E0E0E0]">
            Login to your account
          </CardTitle>
          <CardDescription className="text-[#E0E0E0]">
            Enter your username below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={formik.handleSubmit}
            noValidate
            className="flex flex-col gap-6 text-[#eeeeee]"
          >
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-[#E0E0E0]">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                name="username"
                placeholder="Your username"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.username}
                required
              />
              {formik.touched.username && formik.errors.username && (
                <p className="text-red-500">{formik.errors.username}</p>
              )}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-[#E0E0E0]">
                  Password
                </Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-[#b7d4ff]"
                >
                  Forgot your password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                required
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500">{formik.errors.password}</p>
              )}
            </div>
            <CardFooter className="flex-col gap-2">
              <Button
                type="submit"
                className="w-full text-black cursor-pointer"
              >
                Login
              </Button>
              <span>
                Don't Have an Account?
                <Link
                  to={"/register"}
                  className="hover:text-blue-300 cursor-pointer"
                >
                  {" "}
                  Register
                </Link>
              </span>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
