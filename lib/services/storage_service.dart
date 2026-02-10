import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:dio/dio.dart';

class StorageService {
  Future<File?> downloadFile(String url, String fileName) async {
    try {
      Directory appDocDir = await getApplicationDocumentsDirectory();
      String savePath = "${appDocDir.path}/$fileName";
      await Dio().download(url, savePath);
      return File(savePath);
    } catch (e) { return null; }
  }
}
