import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
describe("App Component", () => {
  it("renders fitness tracker title", () => {
    render(<App />);
    expect(screen.getByText("Fitness Tracker")).toBeInTheDocument();
  });
 
  it("renders username and password inputs", () => {
    render(<App />);
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });
 
  it("can type in username field", () => {
    render(<App />);
    const usernameInput = screen.getByPlaceholderText("Username");
    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    expect(usernameInput).toHaveValue("testuser");
  });
 
  it("can switch to register tab", () => {
    render(<App />);
    const registerButton = screen.getByRole("button", { name: "Register" });
    fireEvent.click(registerButton);
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  });
});