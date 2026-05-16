package com.example.demo.util;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.util.ArrayList;
import java.util.List;

public class FileUtil {

    private static final String FILE = "bikes.txt";

    public static void save(String data) {
        try (FileWriter fw = new FileWriter("bikes.txt", true)) {
            fw.write(data + "\n");
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    public static List<String> read() {
        List<String> list = new ArrayList();

        String line;
        try (BufferedReader br = new BufferedReader(new FileReader("bikes.txt"))) {
            while((line = br.readLine()) != null) {
                list.add(line);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }
}
