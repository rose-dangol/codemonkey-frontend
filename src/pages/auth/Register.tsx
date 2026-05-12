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
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import noUserLogo from "@/assets/images/Nouser.jpg";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { RegisterUser } from "@/services/Authenticate";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const [UserLogo, setUserLogo] = useState<File | null>(null);
  const navigate = useNavigate();
  const { onLoginSuccess } = useAuth();
  const formik = useFormik({
    initialValues: {
      username: "",
      passwordHash: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Username is required"),
      passwordHash: Yup.string().required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("passwordHash")], "Passwords must match")
        .required("Confirm Password is required"),
    }),
    onSubmit: async (values) => {
      const data = await RegisterUser({
        username: values.username,
        passwordHash: values.passwordHash,
        file: UserLogo,
      });
      onLoginSuccess(data.accessToken);
      navigate("/login");
    },
  });
  return (
    <div className="flex justify-center items-center h-screen bg-[#212121]">
      <Card className="w-full max-w-md bg-[#2C2C2C] shadow-lg shadow-black/50 rounded-xl border-0">
        <CardHeader>
          <CardTitle className="text-gray-200">Create an Account</CardTitle>
          <CardDescription className="text-gray-400">
            Enter your details below to register
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            className="flex flex-col gap-6 text-[#eeeeee]"
            onSubmit={formik.handleSubmit}
          >
            {/* Username */}
            <div className="grid gap-2 relative w-16 h-16 mb-3">
              {/* Avatar */}
              <Avatar className="w-full h-full border-2 border-white rounded-full overflow-hidden">
                <AvatarImage
                  src={UserLogo ? URL.createObjectURL(UserLogo) : noUserLogo}
                  className="w-full h-full object-cover rounded-full"
                />
                <AvatarFallback className="rounded-full">CN</AvatarFallback>
              </Avatar>

              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-5 h-5 bg-black rounded-full border-2 border-white flex items-center justify-center cursor-pointer"
              >
                <Plus className="text-white w-3 h-3" />
              </label>

              {/* Hidden input */}
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUserLogo(file);
                  // const reader = new FileReader();
                  // reader.onload = () => setUserLogo(reader.result as string);
                  // reader.readAsDataURL(file);
                }}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username" className="text-gray-200">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.username}
                placeholder="Your username"
                required
              />
              {formik.touched.username && formik.errors.username && (
                <p className="text-red-500">{formik.errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-gray-200">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                name="passwordHash"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.passwordHash}
                placeholder="Enter password"
                required
              />
              {formik.touched.passwordHash && formik.errors.passwordHash && (
                <p className="text-red-500">{formik.errors.passwordHash}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-gray-200">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
                placeholder="Re-enter password"
                required
              />
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <p className="text-red-500">
                    {formik.errors.confirmPassword}
                  </p>
                )}
            </div>
            <CardFooter className="flex-col gap-1.5">
              <Button
                type="submit"
                className="w-full text-black cursor-pointer"
              >
                Register
              </Button>
              <span>
                Already Have an Account?
                <Link
                  to={"/login"}
                  className="hover:text-blue-300 cursor-pointer"
                >
                  {" "}
                  Log In
                </Link>
              </span>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
