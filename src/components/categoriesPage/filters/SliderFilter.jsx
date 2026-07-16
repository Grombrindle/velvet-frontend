"use client";
import React from "react";

export default function SliderFilter({ filter, value = {}, onChange }) {
  const minValue = value.min ?? filter?.range?.min ?? 0;
  const maxValue = value.max ?? filter?.range?.max ?? 1000;

  return (
    <div className="space-y-3 -3xl border border-slate-200 bg-white p-4 -sm">
      <div className="text-sm font-semibold text-slate-900">{filter.name}</div>
      <div className="text-xs text-slate-500 flex justify-between">
        <span>{Math.round(minValue)}</span>
        <span>{Math.round(maxValue)}</span>
      </div>
      <div className="space-y-3">
        <input
          type="range"
          min={filter?.range?.min ?? 0}
          max={filter?.range?.max ?? 1000}
          value={value.min ?? filter?.range?.min ?? 0}
          onChange={(e) => onChange({ ...value, min: Number(e.target.value) })}
          className="w-full accent-black"
        />
        <input
          type="range"
          min={filter?.range?.min ?? 0}
          max={filter?.range?.max ?? 1000}
          value={value.max ?? filter?.range?.max ?? 0}
          onChange={(e) => onChange({ ...value, max: Number(e.target.value) })}
          className="w-full accent-black"
        />
        <div className="flex items-center gap-3 text-sm text-slate-700">
          <label className="flex-1">
            Min
            <input
              type="number"
              value={Math.round(minValue)}
              onChange={(e) =>
                onChange({ ...value, min: Number(e.target.value) })
              }
              className="mt-1 w-full -2xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="flex-1">
            Max
            <input
              type="number"
              value={Math.round(maxValue)}
              onChange={(e) =>
                onChange({ ...value, max: Number(e.target.value) })
              }
              className="mt-1 w-full -2xl border border-slate-200 px-3 py-2"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
