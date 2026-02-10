import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:gsi_insight/providers/auth_provider.dart';
import 'package:gsi_insight/providers/gsi_provider.dart';
import 'package:gsi_insight/providers/language_provider.dart';
import 'package:gsi_insight/screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp(
    options: const FirebaseOptions(
      apiKey: "AIzaSyBaDtbTyIdVDFd48gqOUX9xslguDR-otQs",
      authDomain: "gsi-madagg.firebaseapp.com",
      databaseURL: "https://gsi-madagg-default-rtdb.firebaseio.com/",
      projectId: "gsi-madagg",
      storageBucket: "gsi-madagg.firebasestorage.app",
      messagingSenderId: "320735531348",
      appId: "1:320735531348:android:1cf742f79479f42b3838c1",
    ),
  );

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LanguageProvider()),
        ChangeNotifierProvider(create: (_) => GSIAuthProvider()),
        ChangeNotifierProxyProvider<GSIAuthProvider, GSIProvider>(
          create: (_) => GSIProvider(),
          update: (_, auth, gsi) => gsi!..updateUser(auth.user),
        ),
      ],
      child: const GSIApp(),
    ),
  );
}

class GSIApp extends StatelessWidget {
  const GSIApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GSI Insight',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF3F51B5),
          primary: const Color(0xFF3F51B5),
          secondary: const Color(0xFF7C4DFF),
          surface: const Color(0xFFF0F4F8),
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(),
      ),
      home: const SplashScreen(),
    );
  }
}
