import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import javax.swing.*;
/*
 * GEMINI:This Traffic Light application was developed with the assistance of Gemini AI
 * as part of a user's request for a Java Swing-based interactive traffic light.
 * 
 * Eva: I supplied gemini with an image of the traffic light from the video and 
 * asked it to recreate it in java swing. with aproxomitely 20 miniutes of debuging it was done
 */

public class TrafficLight extends JFrame implements ActionListener {

    private Color redColor = Color.BLACK;
    private Color yellowColor = Color.BLACK;
    private Color greenColor = Color.BLACK;
    private int currentState = 0; // 0: RED, 1: YELLOW, 2: GREEN

    private JPanel lightPanel;
    private JButton changeButton;

    public TrafficLight() {
        setTitle("Traffic Light");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(new FlowLayout(FlowLayout.CENTER, 5, 15)); // Center button with some padding


        lightPanel = new JPanel() {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                int width = 80;
                int height = 200;
                int diameter = 60;
                int x = (getWidth() - width) / 2;
                int y = (getHeight() - height) / 2;
                int padding = (height - 3 * diameter) / 4;
                Font font = new Font("Arial", Font.BOLD, 14);
                g.setFont(font);
                FontMetrics fm = g.getFontMetrics(font);

                g.setColor(Color.YELLOW);
                g.fillRect(x, y, width, height);
                g.setColor(Color.DARK_GRAY);
                g.drawRect(x, y, width, height);

                // Red light
                g.setColor(redColor);
                g.fillOval(x + (width - diameter) / 2, y + padding, diameter, diameter);
                g.setColor(Color.BLACK);
                g.drawOval(x + (width - diameter) / 2, y + padding, diameter, diameter);
                String redText = "Red";
                int redTextWidth = fm.stringWidth(redText);
                g.drawString(redText, x + (width - redTextWidth) / 2, y + padding + (diameter + fm.getAscent()) / 2);

                // Yellow light
                g.setColor(yellowColor);
                g.fillOval(x + (width - diameter) / 2, y + 2 * padding + diameter, diameter, diameter);
                g.setColor(Color.BLACK);
                g.drawOval(x + (width - diameter) / 2, y + 2 * padding + diameter, diameter, diameter);
                String yellowText = "Yellow";
                int yellowTextWidth = fm.stringWidth(yellowText);
                g.drawString(yellowText, x + (width - yellowTextWidth) / 2, y + 2 * padding + diameter + (diameter + fm.getAscent()) / 2);


                // Green light
                g.setColor(greenColor);
                g.fillOval(x + (width - diameter) / 2, y + 3 * padding + 2 * diameter, diameter, diameter);
                g.setColor(Color.BLACK);
                g.drawOval(x + (width - diameter) / 2, y + 3 * padding + 2 * diameter, diameter, diameter);
                String greenText = "Green";
                int greenTextWidth = fm.stringWidth(greenText);
                g.drawString(greenText, x + (width - greenTextWidth) / 2, y + 3 * padding + 2 * diameter + (diameter + fm.getAscent()) / 2);

            }

            @Override
            public Dimension getPreferredSize() {
                return new Dimension(100, 250);
            }
        };

        changeButton = new JButton("Change");
        changeButton.addActionListener(this);

        // Initially set to red
        redColor = Color.RED;
        lightPanel.repaint();

        add(lightPanel);
        add(changeButton);

        pack();
        setLocationRelativeTo(null);
        setVisible(true);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getSource() == changeButton) {
            // Turn off the current light
            if (currentState == 0) {
                redColor = Color.BLACK;
            } else if (currentState == 1) {
                greenColor = Color.BLACK;
            } else if (currentState == 2) {
                yellowColor = Color.BLACK;
            }

            // Move to the next state
            currentState = (currentState + 1) % 3;

            // Turn on the new current light
            if (currentState == 0) {
                redColor = Color.RED;
            } else if (currentState == 1) {
                greenColor = Color.GREEN;
            } else if (currentState == 2) {
                yellowColor = Color.YELLOW;
            }

            lightPanel.repaint();
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new TrafficLight());
    }
}