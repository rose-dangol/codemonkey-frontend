import React from "react";

// Define the interface for the component props
interface ToggleSwitchProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  label,
  onChange,
}) => {
  return (
    <label className="hidden flex items-center gap-3 cursor-pointer select-none">
      {/* Hidden checkbox for accessibility */}
      <input
        type="checkbox"
        checked={checked}
        // Pass the inverted boolean back to the parent onClick/onChange
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />

      {/* Switch Track */}
      <div
        className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out relative ${
          checked ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        {/* Switch Thumb */}
        <div
          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out absolute top-1 left-1 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>

      {/* Label Text */}
      <span className="text-gray-700 font-medium">{label}</span>
    </label>
  );
};

export default ToggleSwitch;
