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
import { Label } from "@radix-ui/react-label";
import { Link, useNavigate } from "react-router-dom";
const Login = () => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-center items-center h-screen bg-[#212121]">

    <Card className="w-full  max-w-sm m-auto bg-[#2C2C2C] border-0">
      <CardHeader>
        <CardTitle className="text-[#E0E0E0]">Login to your account</CardTitle>
        <CardDescription className="text-[#E0E0E0]">
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-[#E0E0E0]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-[#E0E0E0]">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-[#b7d4ff]"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" required />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">

        <Button type="submit" className="w-full " onClick={() => {navigate("/home")}}>
          Login
        </Button>
        <Link to={"/register"} className="w-full">
        
        <Button variant="outline" className="w-full bg-[#E0E0E0]">
          Register
        </Button>
        </Link>
      </CardFooter>
    </Card>
    </div>
  );
};

export default Login;
