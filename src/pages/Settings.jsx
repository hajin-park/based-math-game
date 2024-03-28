import {
    SettingsHeader,
    BaseSelect,
    RangeInput,
    ChosenSettingsTable,
    DurationSelect,
} from "@features/quiz";

export default function Settings() {
    return (
        <>
            <SettingsHeader />
            <BaseSelect />
            <RangeInput />
            <ChosenSettingsTable />
            <DurationSelect />
        </>
    );
}
