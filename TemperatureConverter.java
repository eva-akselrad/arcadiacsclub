import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import javax.swing.*;
public class TemperatureConverter extends JFrame implements ActionListener {

    private JTextField celsiusTextField;
    private JTextField fahrenheitTextField;
    private JButton celsiusToFahrenheitButton;
    private JButton fahrenheitToCelsiusButton;
    private JButton exitButton;

    public TemperatureConverter() {
        setTitle("Temperature Converter");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(5, 5, 5, 5); // Add some padding

        // Celsius Label
        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.anchor = GridBagConstraints.WEST;
        add(new JLabel("Celsius"), gbc);

        // Celsius Text Field
        gbc.gridx = 1;
        gbc.gridy = 0;
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.weightx = 1.0; 
        celsiusTextField = new JTextField(10);
        add(celsiusTextField, gbc);
        gbc.weightx = 0.0;

        // Fahrenheit Label
        gbc.gridx = 2;
        gbc.gridy = 0;
        gbc.anchor = GridBagConstraints.WEST;
        add(new JLabel("Fahrenheit"), gbc);

        // Fahrenheit Text Field
        gbc.gridx = 3;
        gbc.gridy = 0;
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.weightx = 1.0; 
        fahrenheitTextField = new JTextField(10);
        add(fahrenheitTextField, gbc);
        gbc.weightx = 0.0; 
        // Celsius Calculate Button
        gbc.gridx = 1;
        gbc.gridy = 1;
        gbc.fill = GridBagConstraints.NONE;
        celsiusToFahrenheitButton = new JButton("Calculate");
        celsiusToFahrenheitButton.addActionListener(this);
        add(celsiusToFahrenheitButton, gbc);

        // Fahrenheit Calculate Button
        gbc.gridx = 3;
        gbc.gridy = 1;
        gbc.fill = GridBagConstraints.NONE;
        fahrenheitToCelsiusButton = new JButton("Calculate");
        fahrenheitToCelsiusButton.addActionListener(this);
        add(fahrenheitToCelsiusButton, gbc);

        // Exit Button
        gbc.gridx = 0;
        gbc.gridy = 2;
        gbc.gridwidth = 4; 
        gbc.fill = GridBagConstraints.HORIZONTAL;
        exitButton = new JButton("Exit");
        exitButton.addActionListener(this);
        add(exitButton, gbc);
        gbc.gridwidth = 1; 

        pack();
        setLocationRelativeTo(null); 
        setVisible(true);
    }

    @Override
    public void actionPerformed(ActionEvent e) {//this does the actual calculations and handeling of the button press
        if (e.getSource() == celsiusToFahrenheitButton) {
            try {
                double celsius = Double.parseDouble(celsiusTextField.getText());
                double fahrenheit = (celsius * 9 / 5) + 32;// calculates from cel
                fahrenheitTextField.setText(String.format("%.2f", fahrenheit));
            } catch (NumberFormatException ex) {// simple try catch error check
                JOptionPane.showMessageDialog(this, "Invalid input for Celsius", "Error", JOptionPane.ERROR_MESSAGE);
                celsiusTextField.setText("");
                fahrenheitTextField.setText("");
            }
        } else if (e.getSource() == fahrenheitToCelsiusButton) {
            try {
                double fahrenheit = Double.parseDouble(fahrenheitTextField.getText());
                double celsius = (fahrenheit - 32) * 5 / 9;//calculates from fah
                celsiusTextField.setText(String.format("%.2f", celsius));
            } catch (NumberFormatException ex) {// error check
                JOptionPane.showMessageDialog(this, "Invalid input for Fahrenheit", "Error", JOptionPane.ERROR_MESSAGE);
                celsiusTextField.setText("");
                fahrenheitTextField.setText("");
            }
        } else if (e.getSource() == exitButton) {
            System.exit(0);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new TemperatureConverter());
    }
}