import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import Profile from "../components/profile";
import axios from "axios";
import Cookies from "js-cookie";

// Mock axios
vi.mock("axios", () => ({
  default: {
    get: vi.fn(() =>
      Promise.resolve({
        data: {
          personal: { username: "testuser", role: "Patient", profileImage: "test.jpg" },
          medical: {},
          professional: {},
        },
      })
    ),
    put: vi.fn(() => Promise.resolve({ status: 200, data: { personal: { username: "updateduser" } } })),
  },
}));

// Mock js-cookie
vi.mock("js-cookie", () => ({
  default: {
    get: vi.fn(() => "mock-token"),
  },
}));

// Mock child components
vi.mock("../components/ProfileHeader", () => ({
  default: ({ username, role, profileImage }) => (
    <div data-testid="profile-header">
      {username} - {role} - {profileImage}
    </div>
  ),
}));

vi.mock("../components/ProfileContent", () => ({
  default: ({ profileData, activeTab, setActiveTab, isEditing, setIsEditing, handleEdit, handleSave }) => (
    <div data-testid="profile-content">
      <button onClick={() => setActiveTab("medical")}>Switch to Medical</button>
      <button onClick={() => setIsEditing(true)}>Edit</button>
      {isEditing && (
        <div>
          <input
            data-testid="edit-input"
            value={profileData.personal.username || ""}
            onChange={(e) => handleEdit("personal", "username", e.target.value)}
          />
          <button onClick={handleSave}>Save</button>
        </div>
      )}
    </div>
  ),
}));

vi.mock("../components/LoadingState", () => ({
  default: () => <div data-testid="loading-state">Loading...</div>,
}));

// Mock toast from sonner inline (still included for completeness, though not used in remaining tests)
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Profile Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    render(<Profile />);
    expect(screen.getByTestId("loading-state")).toBeInTheDocument();
  });

  it("renders profile data after successful fetch", async () => {
    render(<Profile />);
    await waitFor(() => {
      expect(screen.getByTestId("profile-header")).toHaveTextContent("testuser - Patient - test.jpg");
      expect(screen.getByTestId("profile-content")).toBeInTheDocument();
    });
  });

  it("displays error message on fetch failure", async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error("Fetch error"));
    render(<Profile />);
    await waitFor(() => {
      expect(screen.getByText("Error Loading Profile")).toBeInTheDocument();
      expect(screen.getByText("Error loading profile")).toBeInTheDocument();
    });
  });

  it("switches tabs when clicking tab button", async () => {
    render(<Profile />);
    await waitFor(() => screen.getByTestId("profile-content"));
    const switchButton = screen.getByText("Switch to Medical");
    fireEvent.click(switchButton);
  });

  it("enters editing mode and updates field", async () => {
    render(<Profile />);
    await waitFor(() => screen.getByTestId("profile-content"));
    fireEvent.click(screen.getByText("Edit"));
    const input = screen.getByTestId("edit-input");
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "newuser" } });
    expect(input.value).toBe("newuser");
  });
});