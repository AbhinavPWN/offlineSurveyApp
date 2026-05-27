// src/features/member-form/hooks/useFormErrorFocus.ts

import { useRef, RefObject, useCallback } from "react";
import { ScrollView, View, findNodeHandle, UIManager } from "react-native";

export function useFormErrorFocus(scrollRef: RefObject<ScrollView | null>) {
  const fieldRefs = useRef<Record<string, View | null>>({});

  const refCallbacks = useRef<Record<string, (node: View | null) => void>>({});

  const registerField = useCallback((fieldName: string) => {
    if (!refCallbacks.current[fieldName]) {
      refCallbacks.current[fieldName] = (node: View | null) => {
        fieldRefs.current[fieldName] = node;
      };
    }

    return refCallbacks.current[fieldName];
  }, []);

  const scrollToFirstError = useCallback(
    (errors?: Record<string, unknown>) => {
      if (!errors || !scrollRef.current) return;

      const errorFields = Object.entries(errors)
        .filter(
          ([_, value]) => typeof value === "string" && value.trim().length > 0,
        )
        .map(([field]) => field);

      if (errorFields.length === 0) return;

      const fieldsWithRefs = errorFields.filter(
        (field) => !!fieldRefs.current[field],
      );

      if (fieldsWithRefs.length === 0) {
        scrollRef.current.scrollTo({
          y: 0,
          animated: true,
        });
        return;
      }

      const scrollHandle = findNodeHandle(scrollRef.current);

      if (!scrollHandle) return;

      const measurements: {
        field: string;
        y: number;
      }[] = [];

      let pending = fieldsWithRefs.length;

      const finish = () => {
        if (measurements.length === 0) {
          scrollRef.current?.scrollTo({
            y: 0,
            animated: true,
          });
          return;
        }

        measurements.sort((a, b) => a.y - b.y);

        const firstError = measurements[0];

        scrollRef.current?.scrollTo({
          y: Math.max(firstError.y - 120, 0),
          animated: true,
        });
      };

      fieldsWithRefs.forEach((field) => {
        const node = fieldRefs.current[field];

        if (!node) {
          pending--;

          if (pending === 0) finish();

          return;
        }

        const nodeHandle = findNodeHandle(node);

        if (!nodeHandle) {
          pending--;

          if (pending === 0) finish();

          return;
        }

        UIManager.measureLayout(
          nodeHandle,
          scrollHandle,
          () => {
            pending--;

            if (pending === 0) finish();
          },
          (_x, y) => {
            measurements.push({
              field,
              y,
            });

            pending--;

            if (pending === 0) finish();
          },
        );
      });
    },
    [scrollRef],
  );

  return {
    registerField,
    scrollToFirstError,
  };
}
