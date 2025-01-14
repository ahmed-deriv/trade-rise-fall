import { Text, TextField, TextFieldWithSteppers } from "@deriv-com/quill-ui";
import { Tab } from "../Tab";
import { DurationTabValue } from "../types";

interface DurationSectionProps {
  duration: number;
  selectedDurationTab: DurationTabValue;
  durationError: string;
  setDuration: (value: string) => void;
  setSelectedDurationTab: (value: DurationTabValue) => void;
}

interface DurationTab {
  label: string;
  value: DurationTabValue;
}

export const DurationSection = ({
  duration,
  selectedDurationTab,
  durationError,
  setDuration,
  setSelectedDurationTab,
}: DurationSectionProps) => {
  const durationTabs: DurationTab[] = [
    { label: "Duration", value: "duration" },
    { label: "End time", value: "endtime" },
  ];

  return (
    <div className="duration-endtime-section">
      <Tab
        tabs={durationTabs}
        activeTab={selectedDurationTab}
        onChange={setSelectedDurationTab}
      />
      {selectedDurationTab === "duration" ? (
        <div className="duration-input">
          <Text as="span" size="sm" className="text-bold">
            Minutes
          </Text>
          <TextFieldWithSteppers
            type="text"
            value={duration.toString()}
            onChange={(e) => setDuration(e.target.value)}
            className="duration-field"
            allowDecimals={false}
            allowSign={false}
            regex={/[^0-9]|^$/g}
            inputMode="numeric"
            shouldRound={true}
            textAlignment="center"
            minusDisabled={Number(duration) - 1 <= 0}
            variant="fill"
            status={durationError ? "error" : "success"}
            message={durationError}
          />
          <Text as="span" size="sm" className="text-less-prominent">
            Range: 15 - 1,440 minutes
          </Text>
        </div>
      ) : (
        <div className="endtime-inputs">
          <TextField
            type="text"
            value="03 Jan 2025"
            readOnly
            className="date-input"
          />
          <TextField
            type="text"
            value="03:20 GMT"
            readOnly
            className="time-input"
          />
        </div>
      )}
    </div>
  );
};
