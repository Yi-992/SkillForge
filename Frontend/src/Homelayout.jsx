import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

function HomeLayout() {
  return (
    <div style={rootStyle}>
      <Navbar />
      <main style={contentStyle}>
        <Outlet />
      </main>
    </div>
  );
}

const rootStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 8% 0%, rgba(56,189,248,0.15), transparent 34%), radial-gradient(circle at 92% 8%, rgba(59,130,246,0.12), transparent 32%)",
};

const contentStyle = {
  width: "100%",
};

export default HomeLayout;
