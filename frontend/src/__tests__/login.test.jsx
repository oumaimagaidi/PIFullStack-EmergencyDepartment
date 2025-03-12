import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom"; // Mock React Router
import { vi } from "vitest"; // Vitest's mocking utilities
import Login from "../components/login";

// Mock axios
vi.mock("axios", () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: { user: { username: "testuser", role: "Patient" } } })),
  },
}));

// Mock GoogleOAuthProvider and GoogleLogin
vi.mock("@react-oauth/google", () => ({
  GoogleOAuthProvider: ({ children }) => <div>{children}</div>,
  GoogleLogin: ({ onSuccess }) => (
    <button onClick={() => onSuccess({ credential: "mock-token" })}>Google Login</button>
  ),
}));

describe("Login Component", () => {
  it("renders the Sign In heading", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    const headingElement = screen.getByText(/sign in/i);
    expect(headingElement).toBeInTheDocument();
  });
});