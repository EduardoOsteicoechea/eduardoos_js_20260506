import { useState } from 'react';
import UnitTypePicker from './UnitTypePicker';
import SectionContentList from './SectionContentList';
import { addUnitToSection } from './actions/addUnitToSection';

export default function SectionActions({ units = [], onChangeUnits }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleOpenPicker = () => {
    setPickerOpen(true);
  };

  const handleClosePicker = () => {
    setPickerOpen(false);
  };

  const handleSelectType = (type) => {
    onChangeUnits(addUnitToSection(type, units));
    setPickerOpen(false);
  };

  const handleRemoveUnit = (unitId) => {
    onChangeUnits(units.filter((unit) => unit.id !== unitId));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleOpenPicker}
          className="theme-toolbar-btn text-sm"
        >
          + Añadir unidad
        </button>
      </div>

      <SectionContentList units={units} onRemoveUnit={handleRemoveUnit} />

      <UnitTypePicker
        open={pickerOpen}
        onSelect={handleSelectType}
        onClose={handleClosePicker}
      />
    </div>
  );
}
