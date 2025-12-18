/**
 * Input component with label and error states
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, layout } from '../../theme/spacing';
import { textStyles, fontSize } from '../../theme/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  required,
  secureTextEntry,
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const hasError = !!error;
  const isPassword = secureTextEntry !== undefined;

  const inputContainerStyle = [
    styles.inputContainer,
    isFocused && styles.inputContainerFocused,
    hasError && styles.inputContainerError,
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={inputContainerStyle}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || isPassword) && styles.inputWithRightIcon,
            style,
          ]}
          placeholderTextColor={colors.input.placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !isPasswordVisible}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            style={styles.iconRight}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.text.tertiary}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && (
          <View style={styles.iconRight}>{rightIcon}</View>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },

  label: {
    ...textStyles.label,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },

  required: {
    color: colors.error[500],
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input.background,
    borderWidth: 1,
    borderColor: colors.input.border,
    borderRadius: borderRadius.xl,
    minHeight: layout.inputHeight,
  },

  inputContainerFocused: {
    borderColor: colors.input.focusBorder,
    borderWidth: 2,
  },

  inputContainerError: {
    borderColor: colors.error[500],
  },

  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: spacing[4],
    fontSize: fontSize.sm,
    color: colors.text.primary,
  },

  inputWithLeftIcon: {
    paddingLeft: spacing[2],
  },

  inputWithRightIcon: {
    paddingRight: spacing[2],
  },

  iconLeft: {
    paddingLeft: spacing[4],
  },

  iconRight: {
    paddingRight: spacing[4],
  },

  error: {
    ...textStyles.caption,
    color: colors.error[500],
    marginTop: spacing[1],
  },

  hint: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
});
