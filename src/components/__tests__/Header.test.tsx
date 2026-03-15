import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Mock static asset imports (images)
vi.mock("../../assets/tapcalc-logo.png", () => ({ default: "test-logo.png" }));

import { Header } from "../Header";
import { Theme } from "../../types";

describe("Header", () => {
  const defaultProps = {
    theme: Theme.Dark,
    themeName: "Dark",
    activeTab: 0,
    showLabs: false,
    onCycleTheme: vi.fn(),
    onTabChange: vi.fn(),
  };

  it("renders the app title", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText("TapeCalc")).toBeInTheDocument();
  });

  it("renders main navigation tabs", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText("Calculator")).toBeInTheDocument();
    expect(screen.getByText("Units")).toBeInTheDocument();
    expect(screen.getByText("Currency")).toBeInTheDocument();
  });

  it("highlights the active tab", () => {
    render(<Header {...defaultProps} activeTab={1} />);
    const unitsTab = screen.getByText("Units").closest("button");
    expect(unitsTab).toHaveClass("header-tab--active");
  });

  it("calls onTabChange when a tab is clicked", () => {
    const onTabChange = vi.fn();
    render(<Header {...defaultProps} onTabChange={onTabChange} />);
    fireEvent.click(screen.getByText("Units"));
    expect(onTabChange).toHaveBeenCalledWith(1);
  });

  it("calls onCycleTheme when theme button is clicked", () => {
    const onCycleTheme = vi.fn();
    render(<Header {...defaultProps} onCycleTheme={onCycleTheme} />);
    // Theme button shows the theme icon (Moon for dark theme)
    const themeButton = screen.getByRole("button", { name: /theme/i });
    fireEvent.click(themeButton);
    expect(onCycleTheme).toHaveBeenCalled();
  });

  it("shows labs tabs when showLabs is true", () => {
    render(<Header {...defaultProps} showLabs={true} />);
    expect(screen.getByText("Solver")).toBeInTheDocument();
    expect(screen.getByText("Graph")).toBeInTheDocument();
  });

  it("hides labs tabs when showLabs is false", () => {
    render(<Header {...defaultProps} showLabs={false} />);
    expect(screen.queryByText("Solver")).not.toBeInTheDocument();
    expect(screen.queryByText("Graph")).not.toBeInTheDocument();
  });
});
